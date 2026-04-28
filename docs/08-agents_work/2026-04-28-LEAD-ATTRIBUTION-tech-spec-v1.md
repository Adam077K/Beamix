# F12 Lead Attribution Loop — Technical Implementation Spec v1

**Date:** 2026-04-28
**Author:** Backend + AI Engineer
**Status:** IMPLEMENTATION-READY — sufficient for a backend developer to build from scratch
**Feature:** F12 Lead Attribution Loop (PRD-wedge-launch-v3, §F12)
**MVP scope:** Channels 1 (Twilio) + 2 (UTM) + 4 (partial AI engine click data) + 5 (self-reported)
**Deferred to MVP-1.5:** Channel 3 (customer-site JS snippet) — architected here, not built

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Twilio Integration Spec](#2-twilio-integration-spec)
3. [UTM Tagging System](#3-utm-tagging-system)
4. [Form-Attribution Snippet (Architecture Only — MVP-1.5)](#4-form-attribution-snippet-architecture-only)
5. [Attribution Data Model](#5-attribution-data-model)
6. [The "Send to Your Developer" Handoff Design](#6-the-send-to-your-developer-handoff-design)
7. [Monthly Update Headline Rollup Logic](#7-monthly-update-headline-rollup-logic)
8. [Marcus's Day-14 Evangelism Trigger](#8-marcuss-day-14-evangelism-trigger)
9. [Edge Cases and Failure Modes](#9-edge-cases-and-failure-modes)

---

## 1. Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SOURCES                             │
│                                                                     │
│  [AI Engine]      [Twilio]       [Customer Site]   [Customer Self]  │
│  (Perplexity,     (PSTN call     (UTM-tagged        (self-reported  │
│   ChatGPT, etc.)   inbound)       content page)      conversion)   │
│       │               │               │                   │        │
└───────┼───────────────┼───────────────┼───────────────────┼────────┘
        │               │               │                   │
        ▼               ▼               ▼                   ▼
┌───────────────────────────────────────────────────────────────────┐
│                      BEAMIX BACKEND (Next.js)                     │
│                                                                   │
│  /api/webhooks/twilio/voice          ← Twilio TwiML webhook       │
│  /api/attr/{customer_id}             ← UTM click redirect         │
│  /api/attribution/event              ← JS snippet POST (MVP-1.5)  │
│  /api/attribution/self-report        ← self-reported wins         │
│  /api/attribution/summary            ← dashboard data API         │
│                                                                   │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐   │
│  │   Twilio Client       │  │    UTM Builder + Click Logger    │   │
│  │  (number provision,  │  │  (nanoid-tagged URLs, redirect   │   │
│  │   TwiML gen,         │  │   on click, metadata capture)    │   │
│  │   webhook verify)    │  │                                  │   │
│  └──────────────────────┘  └──────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Inngest Functions                          │  │
│  │  attribution.provision-twilio      (async, ~30s)             │  │
│  │  attribution.first-event.evangelism-trigger  (day-14 check)  │  │
│  │  attribution.rollup.daily          (nightly cron)            │  │
│  │  attribution.verify-setup          (72h check)               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
            ┌────────────────────────────────────┐
            │         POSTGRES (Supabase)         │
            │                                    │
            │  attribution_urls                  │
            │  attribution_events                │
            │  twilio_numbers                    │
            │  attribution_rollups               │
            └────────────────────────────────────┘
```

### Data Flow Per Channel

**Channel 1 — Twilio dynamic phone:**
1. Onboarding completion fires Inngest event `attribution.provision-twilio`
2. Inngest step calls Twilio REST API to provision a number per source tag (one for ChatGPT-cited content, one for Perplexity-cited, etc.)
3. Numbers stored in `twilio_numbers` table with `source_tag` FK
4. When AI-cited content is published, it carries the Twilio number for that source
5. Caller dials → Twilio webhook fires `POST /api/webhooks/twilio/voice`
6. Handler verifies Twilio signature, logs call to `attribution_events`, returns TwiML forward
7. Customer sees: number + source association + call count in `/settings → Lead Attribution`

**Channel 2 — UTM-tagged URLs:**
1. Customer (or agent) uses `/attribution/build` to generate a UTM URL
2. URL stored in `attribution_urls` with all UTM params
3. URL embedded in AI-engine-targeted content (FAQ entries, JSON-LD answer fields)
4. When cited content is clicked → visitor lands on `/api/attr/{customer_id}?utm_...`
5. Handler logs event to `attribution_events`, 302-redirects to `attribution_urls.target_url`
6. If customer has installed JS snippet (MVP-1.5), snippet also fires independently
7. Click count incremented in `attribution_urls.click_count` via Postgres trigger

**Channel 3 — JS snippet (MVP-1.5, architecture only):**
See §4.

**Channel 4 — AI engine direct-click data:**
1. Beamix polls Perplexity API citation endpoint (where available) on scan completion
2. Citation click data joined with customer's UTM landing data by `landing_url` + `utm_content` (which encodes the agent action slug)
3. Attribution written to `attribution_events` with `event_type = 'engine_click'`
4. ChatGPT and others without click API: UTM-only attribution applies

**Channel 5 — Self-reported wins:**
1. `/home` surfaces "Did a customer mention AI in your conversation?" prompt (shown once per 30 days)
2. Customer types a one-liner → `POST /api/attribution/self-report`
3. Stored in `attribution_events` with `event_type = 'self_reported'`, `conversion_weight = 0.1`
4. Shown in dashboard as "Self-reported (unverified)" with explicit lower-confidence label

### Latency Budgets

| Channel | Path | Budget | Notes |
|---------|------|--------|-------|
| Twilio call forwarding | Webhook handler → TwiML response | ≤ 1s | Twilio drops call if TwiML not returned in 10s; target 1s including DB write |
| UTM click redirect | Handler → 302 response | ≤ 200ms | Visitor perceives any redirect; must be near-instant |
| Twilio provisioning | Inngest job: API call → DB write | ≤ 2 min | Async; UI shows skeleton state |
| JS snippet POST (MVP-1.5) | Client → /api/attribution/event | ≤ 500ms | Fire-and-forget from browser; non-blocking |
| Attribution summary API | DB query → response | ≤ 300ms | Rollup table pre-aggregates; no on-demand aggregation |

---

## 2. Twilio Integration Spec

### Account Structure

Use a **single Twilio account** with workspace tagging via webhook metadata headers. Sub-accounts add per-sub-account billing complexity that is not worth it at MVP scale. Workspace identity is passed as `customer_id` encoded in the webhook URL path or as a Twilio `StatusCallback` parameter.

Environment variables required:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_SIGNING_KEY=SKxxxxxxxx  # for webhook signature verification
TWILIO_PHONE_NUMBER_POOL_REGION=IL  # primary; fallback: US
```

### Number Provisioning

Triggered as an Inngest job at onboarding completion (or when customer enables Lead Attribution in `/settings`). Provisioning is async — the UI does not block on it.

**Source tags at MVP:** `chatgpt`, `perplexity`, `gemini` (one number per source tag per customer on Build tier; up to plan limit on Scale)

**Twilio API call:**

```typescript
// apps/web/lib/attribution/twilio-provision.ts

import twilio from 'twilio';

export interface ProvisionedNumber {
  phoneNumber: string;
  friendlyName: string;
  twilioSid: string;
  sourceTag: string;
  customerId: string;
}

export async function provisionTrackingNumber(
  customerId: string,
  sourceTag: string,
  region: 'IL' | 'US' | 'GB' = 'IL'
): Promise<ProvisionedNumber> {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );

  // Search for available numbers in region
  const isoCountry = region === 'IL' ? 'IL' : region === 'GB' ? 'GB' : 'US';
  const available = await client.availablePhoneNumbers(isoCountry)
    .local
    .list({ limit: 1, voiceEnabled: true });

  if (!available.length) {
    // Fallback: try US numbers if regional pool exhausted
    if (region !== 'US') {
      return provisionTrackingNumber(customerId, sourceTag, 'US');
    }
    throw new Error(`TWILIO_POOL_EXHAUSTED:${region}`);
  }

  const friendlyName = `beamix-${customerId.slice(0, 8)}-${sourceTag}`;
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/voice/${customerId}`;

  const purchased = await client.incomingPhoneNumbers.create({
    phoneNumber: available[0].phoneNumber,
    friendlyName,
    voiceUrl: webhookUrl,
    voiceMethod: 'POST',
    statusCallback: webhookUrl.replace('/voice/', '/voice-status/'),
    statusCallbackMethod: 'POST',
  });

  return {
    phoneNumber: purchased.phoneNumber,
    friendlyName: purchased.friendlyName,
    twilioSid: purchased.sid,
    sourceTag,
    customerId,
  };
}
```

**Regional support at MVP:** IL (primary), US (fallback), GB (fallback). Cost: $1.00–$1.25/mo per number, borne by Beamix per F12 acceptance criteria. Numbers are provisioned per source tag, not per piece of content. Each customer on Build tier receives up to 3 numbers (one per primary source: ChatGPT-cited, Perplexity-cited, Gemini-cited). Scale tier: up to 20 numbers.

### Webhook Handler

```typescript
// apps/web/app/api/webhooks/twilio/voice/[customerId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const TwilioVoicePayloadSchema = z.object({
  CallSid: z.string(),
  From: z.string(),
  To: z.string(),
  CallStatus: z.string(),
  Direction: z.string(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  // 1. Verify Twilio signature
  const signature = req.headers.get('x-twilio-signature') ?? '';
  const url = req.url;
  const body = Object.fromEntries(await req.formData());

  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN!,
    signature,
    url,
    body as Record<string, string>
  );

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  // 2. Parse payload
  const payload = TwilioVoicePayloadSchema.safeParse(body);
  if (!payload.success) {
    return NextResponse.json({ error: 'Bad payload' }, { status: 400 });
  }

  const { customerId } = params;
  const { CallSid, From, To, CallStatus } = payload.data;

  // 3. Look up which source_tag this number belongs to
  const supabase = createClient();
  const { data: twilioNumber } = await supabase
    .from('twilio_numbers')
    .select('source_tag, id')
    .eq('customer_id', customerId)
    .eq('phone_number', To)
    .single();

  if (!twilioNumber) {
    // Unknown number — log but don't fail; still forward call
    console.error(`Unknown Twilio number ${To} for customer ${customerId}`);
  }

  // 4. Persist call event (caller metadata only — no recording per Trust Safety)
  // Hash caller number for GDPR: store SHA-256 of E.164, never raw
  const callerHash = await hashPhone(From);

  await supabase.from('attribution_events').insert({
    customer_id: customerId,
    event_type: 'call',
    source: twilioNumber?.source_tag ?? 'unknown',
    twilio_call_sid: CallSid,
    caller_hash: callerHash,
    call_status: CallStatus,
    twilio_number_id: twilioNumber?.id ?? null,
    raw_payload: { CallSid, CallStatus, Direction: payload.data.Direction },
    conversion_weight: 1.0,
  });

  // 5. Look up customer's real forwarding number
  const { data: customer } = await supabase
    .from('customers')
    .select('forwarding_phone')
    .eq('id', customerId)
    .single();

  const forwardTo = customer?.forwarding_phone ?? process.env.TWILIO_FALLBACK_NUMBER!;

  // 6. Return TwiML: whisper + forward
  const sourceLabel = twilioNumber?.source_tag
    ? `${twilioNumber.source_tag.replace(/_/g, ' ')} cited content`
    : 'AI search';

  const twiml = new twilio.twiml.VoiceResponse();
  const dial = twiml.dial({ callerId: To });
  dial.number({
    // Whisper to customer before connecting
  }, forwardTo);

  // Whisper: plays to the receiving party before bridge
  const whisperTwiml = new twilio.twiml.VoiceResponse();
  whisperTwiml.say({ voice: 'alice' }, `Beamix-attributed call from ${sourceLabel}.`);

  twiml.say({ voice: 'alice' }, `Connecting.`);

  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

async function hashPhone(phone: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(phone.replace(/\s/g, ''));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

### Provisioning UX Flow

Provisioning is async (~30 seconds for Twilio API round-trip + DB write). The onboarding Step 2 UI must handle this gracefully:

1. Customer clicks "Enable Lead Attribution" in Step 2
2. `POST /api/onboarding/attribution/enable` fires → creates `twilio_numbers` rows with `status = 'provisioning'` → enqueues Inngest job
3. UI immediately shows: skeleton cards for each number with "Provisioning your tracking numbers..." state (spinner, ~5s polling)
4. Inngest job completes → updates `twilio_numbers.status = 'active'`, stores actual phone number
5. Supabase Realtime channel `attribution:setup:{customerId}` broadcasts `PROVISIONING_COMPLETE`
6. UI transitions from skeleton to filled cards showing the actual numbers
7. If Inngest job fails: `status = 'error'`, UI shows fallback message + manual retry CTA

The customer does not wait at Step 2 — provisioning happens in the background. A confirmation email (from the Day 1-6 cadence + attribution-specific follow-up) arrives when numbers are active.

### Twilio Number Limits Per Tier

| Tier | Max Twilio Numbers | Notes |
|------|-------------------|-------|
| Discover | 0 | UTM-only; Twilio not provisioned |
| Build | 3 | One per primary source (ChatGPT, Perplexity, Gemini) |
| Scale | 20 | Full engine coverage + custom source tags |

---

## 3. UTM Tagging System

### URL Builder

The URL builder lives in `/settings → Lead Attribution` and is also called programmatically by agents (Schema Doctor, FAQ Agent) when they publish content that should carry attribution tracking.

**UTM param schema:**
```
utm_source=beamix
utm_medium=ai-search
utm_campaign={source_engine}        e.g., chatgpt-cited
utm_content={action_slug}-{date}    e.g., schema-fix-2026-04-15
```

The `utm_content` field encodes the specific agent action that produced the cited content, enabling per-action attribution tracing.

**URL builder TypeScript stub:**

```typescript
// apps/web/lib/attribution/utm-builder.ts

import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase/server';

export interface UtmUrlParams {
  customerId: string;
  targetUrl: string;       // customer's canonical page URL
  sourceEngine: string;    // e.g., 'chatgpt', 'perplexity', 'gemini'
  actionSlug?: string;     // agent action slug, if applicable
  customTag?: string;      // optional customer-supplied tag
}

export interface AttributionUrl {
  id: string;
  utmUrl: string;          // the full Beamix-proxied URL
  directTaggedUrl: string; // the target URL with UTM params appended directly
}

export async function buildAttributionUrl(params: UtmUrlParams): Promise<AttributionUrl> {
  const { customerId, targetUrl, sourceEngine, actionSlug, customTag } = params;

  const utmParams = new URLSearchParams({
    utm_source: 'beamix',
    utm_medium: 'ai-search',
    utm_campaign: `${sourceEngine}-cited`,
    utm_content: actionSlug
      ? `${actionSlug}-${new Date().toISOString().slice(0, 10)}`
      : (customTag ?? 'manual'),
  });

  const directTaggedUrl = `${targetUrl}?${utmParams.toString()}`;
  const proxyId = nanoid(12); // short, used in /api/attr/{customerId}/{proxyId}

  const supabase = createClient();
  const { data, error } = await supabase
    .from('attribution_urls')
    .insert({
      id: nanoid(21),
      customer_id: customerId,
      source: sourceEngine,
      medium: 'ai-search',
      campaign: `${sourceEngine}-cited`,
      content: actionSlug ?? customTag ?? 'manual',
      target_url: targetUrl,
      direct_tagged_url: directTaggedUrl,
      proxy_id: proxyId,
    })
    .select('id')
    .single();

  if (error) throw new Error(`attribution_url_insert_failed: ${error.message}`);

  const proxyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/attr/${customerId}/${proxyId}`;

  return {
    id: data.id,
    utmUrl: proxyUrl,
    directTaggedUrl,
  };
}
```

**Click logger endpoint:**

```typescript
// apps/web/app/api/attr/[customerId]/[proxyId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { customerId: string; proxyId: string } }
) {
  const { customerId, proxyId } = params;
  const supabase = createClient();

  // 1. Look up the attribution URL
  const { data: attrUrl } = await supabase
    .from('attribution_urls')
    .select('id, target_url, direct_tagged_url, source, campaign, content')
    .eq('customer_id', customerId)
    .eq('proxy_id', proxyId)
    .single();

  if (!attrUrl) {
    // Graceful degradation: redirect to customer's homepage if URL not found
    return NextResponse.redirect(
      `https://${customerId}.beamix.tech`, // fallback — ideally store domain
      { status: 302 }
    );
  }

  // 2. Log click event (non-blocking — fire and don't await full insert)
  const referrer = req.headers.get('referer') ?? '';
  const userAgent = req.headers.get('user-agent') ?? '';
  // Hash IP for GDPR — never store raw
  const ipRaw = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '';
  const ipHash = ipRaw ? await hashIp(ipRaw) : null;

  supabase.from('attribution_events').insert({
    customer_id: customerId,
    event_type: 'utm_click',
    source: attrUrl.source,
    attribution_url_id: attrUrl.id,
    referrer_url: referrer.slice(0, 512),   // truncate
    ip_hash: ipHash,
    raw_payload: {
      campaign: attrUrl.campaign,
      content: attrUrl.content,
      proxy_id: proxyId,
    },
    conversion_weight: 0.7,  // UTM click weighted lower than confirmed call
  }).then(() => {
    // Increment click count via DB trigger (see schema §5)
  });

  // 3. 302 redirect to target URL with UTM params
  return NextResponse.redirect(attrUrl.direct_tagged_url, { status: 302 });
}

async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

### UTM URL Persistence and Distribution Methods

1. **Copy-paste (manual):** Customer copies the Beamix proxy URL from `/settings → Lead Attribution` and pastes it into their content
2. **Agent-generated:** Schema Doctor and FAQ Agent automatically include the correct UTM URL when publishing AI-targeted content. The `actionSlug` in `utm_content` encodes which agent action produced the cited content.
3. **Developer handoff:** "Send to your developer" flow (§6) includes the UTM URL alongside snippet installation instructions
4. **Help doc:** `/help/utm-setup` provides step-by-step instructions for manual CMS placement (WordPress, Shopify, Webflow, plain HTML)

---

## 4. Form-Attribution Snippet (Architecture Only — MVP-1.5)

**Status: DO NOT BUILD AT MVP.** Architecture specified here to enable correct data model design and API contract definition. No production code ships for this channel at MVP.

### Script Tag Shape

```html
<!-- Customer pastes this on every page of their site -->
<script
  src="https://notify.beamix.tech/attr.js"
  data-customer-id="cus_abc123"
  data-api-key="bx_live_xxxxxxxxxxxxxx"
  crossorigin="anonymous"
></script>
```

The `data-api-key` is a per-customer, rotatable API key generated in `/settings → Lead Attribution`. Rotation invalidates the old key and generates a new one. The key is scoped to attribution event ingestion only — it cannot read customer data.

### Runtime JS Shape (~5KB minified)

The snippet executes the following logic (implementation deferred):

```javascript
// Shape only — not production code
(function() {
  var CUSTOMER_ID = document.currentScript.dataset.customerId;
  var API_KEY = document.currentScript.dataset.apiKey;
  var ENDPOINT = 'https://api.beamix.tech/attribution/event';

  // 1. Capture landing context
  var sessionId = getOrCreateSessionId();  // localStorage, 30-min TTL
  var referrer = document.referrer;
  var utmParams = parseUtmParams(location.search);

  // 2. Only fire if Beamix UTM source present
  if (utmParams.utm_source !== 'beamix') return;

  // 3. Listen for form submissions
  document.addEventListener('submit', function(e) {
    var form = e.target;
    var formId = form.id || form.name || form.action;

    navigator.sendBeacon(ENDPOINT, JSON.stringify({
      customer_id: CUSTOMER_ID,
      api_key: API_KEY,
      visitor_session_id: sessionId,
      landing_referrer: referrer,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_content: utmParams.utm_content,
      form_id: formId,
      form_submit_timestamp: Date.now(),
      page_url: location.href,
    }));
  });
})();
```

### API Endpoint Shape (MVP-1.5)

```
POST /api/attribution/event
Authorization: Bearer {api_key}   (customer-scoped, read-write to own events only)

Body (JSON):
{
  customer_id: string,           // validated against API key
  visitor_session_id: string,    // nanoid, 30-min TTL
  landing_referrer: string,      // document.referrer
  utm_source: "beamix",
  utm_medium: "ai-search",
  utm_campaign: string,
  utm_content: string,
  form_id: string,
  form_submit_timestamp: number, // Unix ms
  page_url: string,
  custom_data?: Record<string, unknown>  // max 8KB, JSON
}
```

Schema validation: Zod. Rate limit: 100 events/customer/minute. GDPR: no IP stored; `visitor_session_id` is random; no PII fields accepted in `custom_data` (Zod `.refine()` checks for email/phone patterns). Events expire after 30 days (Postgres partitioning or scheduled cleanup job).

### Verification Check

When customer clicks "Verify install" in the `/attribution/install` modal, Beamix sends a server-side HEAD request to the customer's domain. If `X-Beamix-Installed: true` is present in the response headers (customer adds this via their CMS/CDN), the install is verified. Fallback: Beamix parses the HTML response for the presence of `notify.beamix.tech/attr.js` in script tags.

---

## 5. Attribution Data Model

### SQL DDL

```sql
-- ============================================================
-- TABLE: attribution_urls
-- Every UTM URL created by a customer or agent
-- ============================================================
CREATE TABLE attribution_urls (
  id            TEXT PRIMARY KEY DEFAULT nanoid(21),
  customer_id   UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  proxy_id      TEXT NOT NULL UNIQUE,  -- short id used in /api/attr/{cid}/{proxyId}
  source        TEXT NOT NULL,         -- e.g., 'chatgpt', 'perplexity', 'gemini'
  medium        TEXT NOT NULL DEFAULT 'ai-search',
  campaign      TEXT NOT NULL,         -- e.g., 'chatgpt-cited'
  content       TEXT,                  -- agent action slug + date, or custom tag
  target_url    TEXT NOT NULL,         -- customer's canonical URL (no UTM params)
  direct_tagged_url TEXT NOT NULL,     -- target_url + UTM params appended
  action_id     UUID REFERENCES artifacts(id),  -- FK to agent action that produced this URL
  click_count   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_clicked_at TIMESTAMPTZ,
  archived_at   TIMESTAMPTZ            -- soft-delete; URL still resolves when archived
);

CREATE INDEX idx_attribution_urls_customer_ts
  ON attribution_urls (customer_id, created_at DESC);

CREATE INDEX idx_attribution_urls_source
  ON attribution_urls (customer_id, source, created_at DESC);

-- Increment click_count on new event insert (Channel 2)
CREATE OR REPLACE FUNCTION increment_attribution_url_click()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.event_type = 'utm_click' AND NEW.attribution_url_id IS NOT NULL THEN
    UPDATE attribution_urls
    SET click_count = click_count + 1,
        last_clicked_at = NOW()
    WHERE id = NEW.attribution_url_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_increment_click
  AFTER INSERT ON attribution_events
  FOR EACH ROW EXECUTE FUNCTION increment_attribution_url_click();

-- ============================================================
-- TABLE: attribution_events
-- Every attribution signal: call, utm_click, engine_click, self_reported
-- ============================================================
CREATE TABLE attribution_events (
  id                   TEXT PRIMARY KEY DEFAULT nanoid(21),
  customer_id          UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  event_type           TEXT NOT NULL CHECK (event_type IN (
                         'call', 'utm_click', 'engine_click',
                         'form_submit', 'self_reported'
                       )),
  source               TEXT,          -- engine slug: 'chatgpt', 'perplexity', etc.
  attribution_url_id   TEXT REFERENCES attribution_urls(id),
  twilio_number_id     UUID REFERENCES twilio_numbers(id),
  twilio_call_sid      TEXT,          -- deduplicate on CallSid
  caller_hash          TEXT,          -- SHA-256 of caller E.164; never raw
  ip_hash              TEXT,          -- SHA-256 of visitor IP; never raw
  call_status          TEXT,          -- 'completed', 'no-answer', 'busy', 'failed'
  referrer_url         TEXT,          -- document.referrer, max 512 chars
  landed_url           TEXT,          -- where visitor actually landed
  conversion_value     NUMERIC(10, 2), -- optional: Dani's AOV or contract value
  conversion_weight    NUMERIC(3, 2) NOT NULL DEFAULT 1.0,
  -- 1.0 = confirmed call, 0.7 = utm_click, 0.3 = engine_click, 0.1 = self_reported
  raw_payload          JSONB,         -- full webhook body or click context
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Primary access pattern: customer's events in time order
CREATE INDEX idx_attribution_events_customer_ts
  ON attribution_events (customer_id, created_at DESC);

-- Source-based reporting
CREATE INDEX idx_attribution_events_source_ts
  ON attribution_events (customer_id, source, created_at DESC);

-- Call deduplication
CREATE UNIQUE INDEX idx_attribution_events_call_sid
  ON attribution_events (twilio_call_sid)
  WHERE twilio_call_sid IS NOT NULL;

-- Monthly rollup join support
CREATE INDEX idx_attribution_events_month
  ON attribution_events (customer_id, date_trunc('month', created_at), event_type);

-- RLS: customer can only read own events
ALTER TABLE attribution_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY attr_events_customer_read
  ON attribution_events FOR SELECT
  USING (customer_id = auth.uid());

-- ============================================================
-- TABLE: twilio_numbers
-- Provisioned Twilio phone numbers per customer + source tag
-- ============================================================
CREATE TABLE twilio_numbers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  phone_number    TEXT NOT NULL,      -- E.164, e.g., +97239001234
  friendly_name   TEXT NOT NULL,      -- beamix-{cid_prefix}-{source_tag}
  source_tag      TEXT NOT NULL,      -- 'chatgpt', 'perplexity', 'gemini', etc.
  twilio_sid      TEXT NOT NULL UNIQUE,
  region          TEXT NOT NULL DEFAULT 'IL', -- 'IL', 'US', 'GB'
  status          TEXT NOT NULL DEFAULT 'provisioning'
                  CHECK (status IN ('provisioning', 'active', 'error', 'released')),
  monthly_cost_usd NUMERIC(6, 4) NOT NULL DEFAULT 1.00,
  provisioned_at  TIMESTAMPTZ,
  released_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_twilio_numbers_customer
  ON twilio_numbers (customer_id, status);

CREATE INDEX idx_twilio_numbers_phone
  ON twilio_numbers (phone_number)
  WHERE status = 'active';

-- Twilio SID lookup for webhook routing
CREATE UNIQUE INDEX idx_twilio_numbers_sid
  ON twilio_numbers (twilio_sid);

-- RLS: customers read their own numbers; Twilio webhook handler uses service role
ALTER TABLE twilio_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY twilio_numbers_customer_read
  ON twilio_numbers FOR SELECT
  USING (customer_id = auth.uid());

-- ============================================================
-- TABLE: attribution_rollups
-- Daily pre-aggregated counts for fast Monthly Update generation
-- ============================================================
CREATE TABLE attribution_rollups (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  rollup_date      DATE NOT NULL,
  source           TEXT NOT NULL,     -- engine slug or 'all'
  event_type       TEXT NOT NULL,     -- 'call', 'utm_click', 'engine_click', 'self_reported', 'all'
  event_count      INTEGER NOT NULL DEFAULT 0,
  weighted_value   NUMERIC(10, 4) NOT NULL DEFAULT 0, -- sum of conversion_weight
  conversion_value NUMERIC(10, 2),   -- sum of conversion_value where provided
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (customer_id, rollup_date, source, event_type)
);

CREATE INDEX idx_attribution_rollups_customer_month
  ON attribution_rollups (customer_id, rollup_date DESC);

CREATE INDEX idx_attribution_rollups_source_month
  ON attribution_rollups (customer_id, source, rollup_date DESC);

-- Fast monthly total query
CREATE INDEX idx_attribution_rollups_monthly_total
  ON attribution_rollups (customer_id, date_trunc('month', rollup_date))
  WHERE source = 'all' AND event_type = 'all';
```

### Nightly Rollup Job

The rollup is computed by an Inngest cron `attribution.rollup.daily` running at 01:00 UTC:

```sql
-- Upsert daily rollup for all customers with activity yesterday
INSERT INTO attribution_rollups
  (customer_id, rollup_date, source, event_type, event_count, weighted_value, conversion_value)
SELECT
  customer_id,
  date_trunc('day', created_at)::DATE AS rollup_date,
  COALESCE(source, 'unknown')         AS source,
  event_type,
  COUNT(*)                            AS event_count,
  SUM(conversion_weight)              AS weighted_value,
  SUM(conversion_value)               AS conversion_value
FROM attribution_events
WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
  AND created_at < CURRENT_DATE
GROUP BY customer_id, rollup_date, source, event_type
ON CONFLICT (customer_id, rollup_date, source, event_type)
DO UPDATE SET
  event_count      = EXCLUDED.event_count,
  weighted_value   = EXCLUDED.weighted_value,
  conversion_value = EXCLUDED.conversion_value,
  updated_at       = NOW();
```

---

## 6. The "Send to Your Developer" Handoff Design

### Modal: `/attribution/install`

The install handoff surface is a full-page modal (not a drawer) triggered from:
- Onboarding Step 2, "Send setup instructions to your developer" button
- `/settings → Lead Attribution → "Send to developer"` button
- Any `/home` "Setup attribution" nudge card

**Modal layout:**

```
┌─────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────┐   │
│  │  [Beamix seal — 32px, top left]              │   │
│  │                                              │   │
│  │  Your attribution tracking is ready.         │   │  ← text-h3, Inter 500
│  │  Share these with your developer.            │   │  ← text-base, --color-ink-3
│  │                                              │   │
│  ├──────────────────────────────────────────────┤   │
│  │  TRACKING NUMBERS                            │   │  ← text-xs eyebrow
│  │  ┌────────────────────────────────────────┐  │   │
│  │  │ ChatGPT-cited content                  │  │   │
│  │  │ +972-3-XXX-XXXX        [Copy]          │  │   │
│  │  ├────────────────────────────────────────┤  │   │
│  │  │ Perplexity-cited content               │  │   │
│  │  │ +972-3-XXX-XXXX        [Copy]          │  │   │
│  │  └────────────────────────────────────────┘  │   │
│  │                                              │   │
│  │  YOUR ATTRIBUTION URL                        │   │  ← text-xs eyebrow
│  │  ┌────────────────────────────────────────┐  │   │
│  │  │ https://beamix.tech/api/attr/... [Copy]│  │   │
│  │  └────────────────────────────────────────┘  │   │
│  │                                              │   │
│  │  [Send to your developer  ↗]  [Verify install]│  │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Send to developer flow:**
1. Click "Send to your developer" → email input field appears (pre-filled with billing email, editable)
2. User clicks "Send" → `POST /api/onboarding/attribution/send-dev-email`
3. Resend delivers the developer email within 60 seconds
4. Toast: "Sent to {email}." No page navigation.

**Verify install flow:**
1. Click "Verify install" → loading state
2. `GET /api/attribution/verify?customer_id={id}` — server-side HEAD request to customer's domain
3. Check for `X-Beamix-Installed: true` header OR presence of `notify.beamix.tech/attr.js` in HTML
4. Success: green check + "Verified — attribution tracking active"
5. Failure: amber warning + "Not detected yet — this is normal if your developer hasn't deployed. Try again after deployment."

### Developer Email Template

**Subject:** Your Beamix attribution tracking is ready to install

**Body:**

```
Hi,

Your team is using Beamix to track which AI search citations are driving
real customers to the business. To complete attribution tracking, paste
the following into the <head> section of your site.


Tracking phone numbers
──────────────────────
Route these numbers to your main contact line. When a customer calls
after finding you through AI search, Beamix will attribute the call.

  ChatGPT-cited content:   +972-3-XXX-XXXX
  Perplexity-cited content: +972-3-XXX-XXXX

  (Replace the existing phone on any page that appears in AI search
  results. Use one number per citation source.)


Attribution URL
───────────────
Use this URL wherever Beamix has published AI-targeted content:

  https://beamix.tech/api/attr/{customer_id}/{proxy_id}

It redirects to your actual page after logging the click. No cookies.
No tracking pixels. Just a logged redirect.


Verify the install
──────────────────
After deploying, visit:

  https://app.beamix.tech/attribution/install

Click "Verify install." Beamix will check automatically.


Questions? Reply to this email.

— Beamix
```

The email uses plain-text register. No HTML formatting. Signed "— Beamix." Sent via Resend from `notify.beamix.tech`. The plain-text format is intentional — developer emails look better in monospace clients and read more credibly than HTML templates.

---

## 7. Monthly Update Headline Rollup Logic

### Logic

The Monthly Update generation job (`attribution.rollup.monthly`, fires on 1st of each month via Inngest cron) computes the attribution headline as follows:

```typescript
// apps/web/lib/attribution/monthly-headline.ts

import { createClient } from '@/lib/supabase/server';

interface AttributionHeadline {
  text: string;
  topSources: Array<{ source: string; count: number; eventType: string }>;
  totalEvents: number;
}

export async function computeAttributionHeadline(
  customerId: string,
  month: Date  // first day of the month to compute
): Promise<AttributionHeadline> {
  const supabase = createClient();
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  // Pull from rollup table — never from raw events at report time
  const { data: rollups } = await supabase
    .from('attribution_rollups')
    .select('source, event_type, event_count, weighted_value')
    .eq('customer_id', customerId)
    .gte('rollup_date', monthStart.toISOString().slice(0, 10))
    .lte('rollup_date', monthEnd.toISOString().slice(0, 10))
    .neq('source', 'all')      // exclude pre-aggregated totals; compute fresh
    .neq('event_type', 'all');

  if (!rollups || rollups.length === 0) {
    return {
      text: 'Attribution data warming up — first month is always quiet.',
      topSources: [],
      totalEvents: 0,
    };
  }

  // Aggregate by source + event_type
  const bySource: Record<string, { calls: number; clicks: number; total: number }> = {};
  let totalEvents = 0;

  for (const row of rollups) {
    if (!bySource[row.source]) {
      bySource[row.source] = { calls: 0, clicks: 0, total: 0 };
    }
    if (row.event_type === 'call') {
      bySource[row.source].calls += row.event_count;
    } else if (row.event_type === 'utm_click' || row.event_type === 'engine_click') {
      bySource[row.source].clicks += row.event_count;
    }
    bySource[row.source].total += row.event_count;
    totalEvents += row.event_count;
  }

  // Sort sources by total, take top 3
  const topSources = Object.entries(bySource)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 3)
    .map(([source, counts]) => ({
      source: formatSourceName(source),
      count: counts.total,
      eventType: counts.calls > counts.clicks ? 'calls' : 'UTM-attributed clicks',
    }));

  // Generate headline
  const primarySource = topSources[0];
  const totalCalls = Object.values(bySource).reduce((s, b) => s + b.calls, 0);
  const totalClicks = Object.values(bySource).reduce((s, b) => s + b.clicks, 0);

  let headline: string;

  if (topSources.length === 1) {
    // Single dominant source
    headline = `${primarySource.count} ${primarySource.eventType} from `
      + `Beamix-tracked ${primarySource.source} citations this month — your top driver.`;
  } else if (topSources.length >= 2 && topSources.length <= 3) {
    // Multiple sources — list all
    const parts = topSources.map(s => `${s.count} from ${s.source}`).join(', ');
    headline = `${totalEvents} attributed signals this month: ${parts}.`;
  } else {
    // High-volume fallback (shouldn't hit — covered by slice(0,3) above)
    headline = `${totalCalls} calls + ${totalClicks} UTM-attributed clicks from `
      + `${Object.keys(bySource).length} citation sources this month.`;
  }

  return { text: headline, topSources, totalEvents };
}

function formatSourceName(slug: string): string {
  const names: Record<string, string> = {
    chatgpt: 'ChatGPT',
    perplexity: 'Perplexity',
    gemini: 'Gemini',
    claude: 'Claude',
    grok: 'Grok',
    you_com: 'You.com',
    ai_overviews: 'AI Overviews',
    bing_copilot: 'Bing Copilot',
    meta_ai: 'Meta AI',
    mistral: 'Mistral',
    deepseek: 'DeepSeek',
    unknown: 'AI search',
  };
  return names[slug] ?? slug;
}
```

### Edge Cases

| Condition | Behavior |
|-----------|----------|
| 0 events in month | Headline: "Attribution data warming up — first month is always quiet." |
| Only self-reported events | Headline still generates, but copy reads "1 self-reported win — attribution tracking active but no verified signals yet." |
| Single source dominates | Single-source headline ("23 calls from Beamix-tracked Perplexity citations this month — your top driver") |
| Multiple sources | Top 3 listed with counts |
| Conversion value present (Dani's AOV) | Append " · estimated $X,XXX in attributed revenue" when `conversion_value` is populated |

### Monthly Update PDF: PII Scrubbing

Attribution section of the PDF must not contain raw phone numbers. The PDF renderer applies this scrub:
- `caller_hash` is displayed as "from a tracked source" — not decoded
- Phone numbers shown as "+972-3-XXX-XXXX" (masked) — not the full number
- Count-based display only: "47 calls" not caller identities

---

## 8. Marcus's Day-14 Evangelism Trigger

### Inngest Function

```typescript
// apps/web/inngest/functions/attribution-evangelism.ts

import { inngest } from '../client';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

export const attributionEvangelismTrigger = inngest.createFunction(
  {
    id: 'attribution.first-event.evangelism-trigger',
    name: 'Attribution: Day-14 First-Event Evangelism Trigger',
    concurrency: { limit: 10 },
  },
  // Triggered by: scheduled nightly check (day-14 window)
  { cron: '0 9 * * *' },  // 09:00 UTC daily; filters by customer age internally
  async ({ step }) => {

    const supabase = createClient();

    // Step 1: Find customers in their day-13 to day-15 window
    // (check a 3-day window to handle timezone variation + job drift)
    const { customers } = await step.run('find-day-14-customers', async () => {
      const { data } = await supabase
        .from('customers')
        .select('id, email, onboarding_completed_at, evangelism_email_sent_at')
        .gte('onboarding_completed_at', new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString())
        .lte('onboarding_completed_at', new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString())
        .is('evangelism_email_sent_at', null);  // idempotency: only fire once per customer
      return { customers: data ?? [] };
    });

    // Step 2: For each candidate, check attribution event count
    const eligible: string[] = await step.run('check-attribution-events', async () => {
      const eligibleIds: string[] = [];
      for (const customer of customers) {
        const { count } = await supabase
          .from('attribution_events')
          .select('id', { count: 'exact', head: true })
          .eq('customer_id', customer.id)
          .gte('created_at', customer.onboarding_completed_at);

        if ((count ?? 0) >= 1) {
          eligibleIds.push(customer.id);
        }
      }
      return eligibleIds;
    });

    if (eligible.length === 0) return { sent: 0 };

    // Step 3: Send evangelism email to each eligible customer
    const results = await step.run('send-evangelism-emails', async () => {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const sent: string[] = [];

      for (const customerId of eligible) {
        const customer = customers.find(c => c.id === customerId)!;

        // Get first attribution event for subject-line personalization
        const { data: firstEvent } = await supabase
          .from('attribution_events')
          .select('source, event_type, created_at')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        const sourceLabel = firstEvent?.source
          ? formatSourceName(firstEvent.source)
          : 'an AI engine';

        await resend.emails.send({
          from: 'Beamix <hello@notify.beamix.tech>',
          to: customer.email,
          subject: `We earned the first one.`,
          text: buildEvangelismEmailText(sourceLabel, customerId),
        });

        // Mark as sent — idempotency
        await supabase
          .from('customers')
          .update({ evangelism_email_sent_at: new Date().toISOString() })
          .eq('id', customerId);

        sent.push(customerId);
      }

      return sent;
    });

    return { sent: results.length };
  }
);

function formatSourceName(slug: string): string {
  const names: Record<string, string> = {
    chatgpt: 'ChatGPT', perplexity: 'Perplexity', gemini: 'Gemini',
    claude: 'Claude', grok: 'Grok', you_com: 'You.com',
    ai_overviews: 'Google AI Overviews',
  };
  return names[slug] ?? 'an AI engine';
}
```

### Email Template

**Subject:** We earned the first one.

**Body:**

```
Someone found you through AI search.

Beamix tracked it — a click from content we helped you appear in on
{sourceLabel}. That's the loop working.

Your attribution dashboard shows what happened:

  {dashboardUrl}

This is what we're here for.

— Beamix
```

**Notes on copy:**
- 68 words. Under 80 words as specified.
- No "Congratulations." No "Exciting news." No hyperbole.
- One action: view the dashboard. No secondary CTAs.
- The Beamix Seal (32px, cream-paper background) renders above the body in the HTML version. The plain-text version omits the seal.
- The brief binding line rotates from the current customer's Brief — pulled from `briefs.clauses[0].text` and rendered below the signature in Fraunces 300 italic at 13px (HTML only).
- Signed "— Beamix" — never an agent name.

**Schema additions required on `customers` table:**
```sql
ALTER TABLE customers ADD COLUMN evangelism_email_sent_at TIMESTAMPTZ;
```

---

## 9. Edge Cases and Failure Modes

### Twilio Regional Number Shortage (IL Pool Exhausted)

**Trigger:** `provisionTrackingNumber()` finds 0 available IL numbers.

**Handling:**
1. Function retries with `region = 'US'` automatically (see `provisionTrackingNumber` implementation — recursive fallback)
2. If US also exhausted: `twilio_numbers.status = 'error'`, error message stored in `twilio_numbers.error_details`
3. UI: the number card in `/settings → Lead Attribution` shows: "Tracking number unavailable in your region — using a US number instead" (amber note, not an error state)
4. Email to customer: "Your Beamix tracking number has been assigned a US number (+1-xxx) — it works identically, though it may display differently to your customers."
5. Internal alert: `audit_log` entry with `severity = 'info'`, source = `twilio-provision`, message = `IL_POOL_EXHAUSTED:${customerId}`

### Customer Doesn't Install Snippet After 30 Days

**30-day check:** Inngest cron `attribution.verify-setup` runs weekly. For customers with `twilio_numbers.status = 'provisioning_sent'` and `snippet_installed = false` for >30 days:

1. `/home` surfaces a single soft nudge card (not a banner, not nag): "Attribution tracking is UTM-only right now — full setup takes 5 minutes." Link to `/attribution/install`. Shows once per 14 days.
2. Email cadence: one reminder at 30 days (not part of day 1-6 sequence — separate template). After that: no more nudges. The customer is on UTM-only attribution indefinitely — which is acceptable.
3. System auto-transitions: `customers.attribution_mode = 'utm_only'` after 30 days without snippet install. Affects dashboard copy only (no feature degradation).

### Customer Site Blocks Beamix Verification Crawler

**Scenario:** `/api/attribution/verify` HEAD request returns 403 or is blocked by WAF/CDN.

**Handling:**
1. Verification returns `{ status: 'blocked', message: 'Your site blocked the verification check.' }`
2. UI shows: "We couldn't verify automatically. Add the following HTTP header to your site and click Verify again: `X-Beamix-Installed: true`. Or, check the Network tab in DevTools to confirm the script is loading."
3. Manual override: admin endpoint `/api/admin/attribution/mark-verified?customer_id=` allows Beamix support to manually mark install as verified after customer confirmation.
4. Verification failure does NOT block attribution tracking — events still log if the snippet is installed correctly. Verification is cosmetic confirmation only.

### GDPR Compliance

The attribution data model is designed for GDPR compliance from the start:

| Data point | Treatment |
|------------|-----------|
| Caller phone number | SHA-256 hashed before insert; never stored raw. Hashing is one-way: Beamix cannot reverse it. |
| Visitor IP address | SHA-256 hashed before insert; never stored raw. |
| `visitor_session_id` (snippet, MVP-1.5) | Random `nanoid`, not tied to user identity. 30-min TTL in localStorage. |
| `form_submit_timestamp` | Unix ms — not a unique identifier. Stored. |
| `raw_payload` JSONB | Call: contains only `CallSid`, `CallStatus`, `Direction` — no PII. Click: contains `campaign`, `content`, `proxy_id` — no PII. |
| `conversion_value` | Optional, customer-provided. Monetary, not personal. |

**DSAR (data subject access request):** If a data subject requests deletion of their data, Beamix cannot identify them in `attribution_events` (no raw phone, no raw IP). The `caller_hash` and `ip_hash` fields can be used if the subject provides their phone/IP for hash-matching. Export to the customer includes all non-hashed fields.

**Customer as sub-processor:** Customer is responsible for GDPR compliance on their own site when using the UTM redirect (Channel 2) and JS snippet (Channel 3 at MVP-1.5). The Beamix DPA (T0.15) designates Beamix as a sub-processor for attribution data, with Twilio and Resend listed as sub-sub-processors.

### Twilio Per-Customer Cost Cap

Monthly Twilio cost per customer scales with number of provisioned numbers + call volume. Cost ceiling enforced as follows:

```typescript
// Monthly Twilio cost check — runs in attribution.rollup.monthly job
const twilioMonthlyCost = activeTwilioNumbers.length * 1.00  // $1/number/month
  + (callMinutes * 0.0085);  // $0.0085/min for IL calls

const tierCeiling = {
  discover: 0,       // no Twilio on Discover
  build: 5.00,       // 3 numbers + call volume
  scale: 25.00,      // 20 numbers + call volume
};

if (twilioMonthlyCost > tierCeiling[customerTier]) {
  // Release excess numbers (oldest provisioned, keep the 3 most-called)
  // Alert ops via audit_log
  // Show in-app notice in /settings → Lead Attribution
}
```

Numbers that exceed the cap are auto-released (Twilio `DELETE /Accounts/{Sid}/IncomingPhoneNumbers/{Sid}.json`) and a notice shown in `/settings`: "One tracking number was paused this month to keep your costs within plan. Upgrade to Scale for more numbers."

---

## Implementation Notes for Backend Developer

**Environment variables to add:**
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_SIGNING_KEY=
TWILIO_PHONE_NUMBER_POOL_REGION=IL
ATTRIBUTION_SNIPPET_SIGNING_KEY=   # for MVP-1.5 snippet API key generation
```

**New Supabase columns on `customers` table:**
```sql
ALTER TABLE customers ADD COLUMN forwarding_phone TEXT;
ALTER TABLE customers ADD COLUMN attribution_mode TEXT NOT NULL DEFAULT 'utm_only'
  CHECK (attribution_mode IN ('utm_only', 'twilio_utm', 'full'));
ALTER TABLE customers ADD COLUMN snippet_installed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN evangelism_email_sent_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN attribution_enabled_at TIMESTAMPTZ;
```

**Package dependencies to add:**
```json
{
  "twilio": "^5.x",
  "nanoid": "^5.x"   // already in project for scan permalink
}
```

**File locations:**
- `apps/web/lib/attribution/twilio-provision.ts` — provisioning logic
- `apps/web/lib/attribution/utm-builder.ts` — URL builder
- `apps/web/lib/attribution/monthly-headline.ts` — rollup headline logic
- `apps/web/app/api/webhooks/twilio/voice/[customerId]/route.ts` — voice webhook
- `apps/web/app/api/attr/[customerId]/[proxyId]/route.ts` — UTM click redirect
- `apps/web/app/api/attribution/summary/route.ts` — dashboard API
- `apps/web/app/api/attribution/self-report/route.ts` — self-reported wins
- `apps/web/inngest/functions/attribution-evangelism.ts` — Day-14 job
- `apps/web/inngest/functions/attribution-provision.ts` — Twilio provisioning job
- `apps/web/inngest/functions/attribution-rollup.ts` — nightly rollup
- `apps/web/inngest/functions/attribution-verify.ts` — 72h + 30-day verification checks

**Migration file:** `apps/web/supabase/migrations/YYYYMMDD_attribution_tables.sql` — include all 4 DDL tables above in a single migration file.
