# Stripe Build Specification

## Overview
Complete Stripe integration for subscription billing, payment processing, and credit allocation. Handles three pricing tiers with monthly/annual billing cycles, trial periods, credit management, and seamless subscription lifecycle management.

---

## Stripe Account Configuration

### Account Type
- **Mode:** Production + Test environments
- **Currency:** USD (primary), EUR (Phase 2 for international)
- **Statement Descriptor:** "GEO Platform" (appears on customer's credit card statement)

### Business Settings
- **Brand:** Upload logo and brand colors for Checkout and Customer Portal
- **Customer Emails:** Enable receipt emails and invoice emails
- **Billing:** Invoice collection method = "charge_automatically"

### Tax Configuration (Phase 2)
- Enable Stripe Tax for automatic sales tax calculation
- Configure tax jurisdictions based on business registration

---

## Products & Pricing

### Product 1: GEO Platform - Starter
**Product Details:**
- **Name:** Starter Plan
- **Description:** Perfect for small businesses getting started with LLM visibility tracking
- **Statement Descriptor:** GEO Starter
- **Features:**
  - Track up to 5 queries
  - 100 credits/month
  - 3 LLM providers (ChatGPT, Claude, Perplexity)
  - Daily ranking updates
  - Basic recommendations
  - Email support

**Pricing:**
- **Monthly Price:** $49/month
  - Price ID: `price_starter_monthly`
  - Billing Period: month
  - Usage Type: licensed (flat fee)

- **Annual Price:** $470/year (20% discount = ~$39/month)
  - Price ID: `price_starter_annual`
  - Billing Period: year
  - Usage Type: licensed

**Metadata:**
```json
{
  "plan_tier": "starter",
  "monthly_credits": "100",
  "max_queries": "5",
  "llm_providers": "chatgpt,claude,perplexity",
  "support_level": "email"
}
```

---

### Product 2: GEO Platform - Professional
**Product Details:**
- **Name:** Professional Plan
- **Description:** For growing businesses serious about AI visibility optimization
- **Statement Descriptor:** GEO Pro
- **Features:**
  - Track up to 25 queries
  - 500 credits/month
  - All 5 LLM providers
  - Daily ranking updates
  - Advanced AI agents (Content Writer, Competitor Research)
  - Priority recommendations
  - Priority email support
  - Competitor tracking (up to 5)

**Pricing:**
- **Monthly Price:** $199/month
  - Price ID: `price_professional_monthly`

- **Annual Price:** $1,910/year (20% discount = ~$159/month)
  - Price ID: `price_professional_annual`

**Metadata:**
```json
{
  "plan_tier": "professional",
  "monthly_credits": "500",
  "max_queries": "25",
  "llm_providers": "all",
  "support_level": "priority",
  "max_competitors": "5"
}
```

---

### Product 3: GEO Platform - Enterprise
**Product Details:**
- **Name:** Enterprise Plan
- **Description:** For organizations requiring advanced GEO capabilities and dedicated support
- **Statement Descriptor:** GEO Enterprise
- **Features:**
  - Unlimited queries
  - 2000 credits/month
  - All 5 LLM providers
  - Real-time ranking updates
  - All AI agents with priority processing
  - Custom recommendations
  - Dedicated account manager
  - API access
  - White-label reports
  - Competitor tracking (unlimited)
  - Custom integrations

**Pricing:**
- **Monthly Price:** $799/month
  - Price ID: `price_enterprise_monthly`

- **Annual Price:** $7,670/year (20% discount = ~$639/month)
  - Price ID: `price_enterprise_annual`

**Metadata:**
```json
{
  "plan_tier": "enterprise",
  "monthly_credits": "2000",
  "max_queries": "unlimited",
  "llm_providers": "all",
  "support_level": "dedicated",
  "api_access": "true",
  "white_label": "true",
  "max_competitors": "unlimited"
}
```

---

### Product 4: Credit Top-Up (Add-on)
**Product Details:**
- **Name:** Additional Credits
- **Description:** Purchase extra credits when you need more AI agent usage
- **Type:** One-time purchase (not recurring)

**Pricing Options:**
- **50 Credits:** $5 (one-time)
  - Price ID: `price_credits_50`
  - Metadata: `{"credit_amount": "50"}`

- **100 Credits:** $9 (one-time, 10% bulk discount)
  - Price ID: `price_credits_100`
  - Metadata: `{"credit_amount": "100"}`

- **500 Credits:** $40 (one-time, 20% bulk discount)
  - Price ID: `price_credits_500`
  - Metadata: `{"credit_amount": "500"}`

**Note:** Credit purchases processed through Stripe Checkout, then added to user's bonus_credits in Supabase

---

## Checkout Configuration

### Checkout Session Settings
- **Mode:** subscription (for plans), payment (for credit top-ups)
- **Success URL:** `https://yourdomain.com/dashboard?session_id={CHECKOUT_SESSION_ID}`
- **Cancel URL:** `https://yourdomain.com/pricing`
- **Allow Promotion Codes:** Yes (enable coupon field)
- **Collect:** Email, billing address
- **Payment Methods:** Card (credit/debit), optionally add Apple Pay, Google Pay
- **Billing Address Collection:** Required

### Trial Configuration
- **Trial Period:** 14 days for all plans
- **Trial End Behavior:** Auto-collect payment after trial
- **Trial Credits:** Allocate full monthly credits during trial
- **Trial Cancellation:** No charge if canceled before trial ends

### Subscription Options
- **Billing Cycle Anchor:** Subscription creation date (consistent billing date)
- **Proration Behavior:** Always invoice immediately when upgrading
- **Days Until Due:** 0 (immediate payment)
- **Collection Method:** charge_automatically

---

## Customer Portal Configuration

### Enable Features
- **Update Payment Method:** Yes
- **View Invoices:** Yes
- **Update Subscription:** Yes (upgrade/downgrade between tiers)
- **Cancel Subscription:** Yes (cancel at period end)
- **Update Email:** Yes
- **View Usage:** No (credits shown in app dashboard)

### Cancellation Settings
- **Cancel Mode:** At period end (not immediate)
- **Cancellation Reasons:** Enable feedback collection
  - Too expensive
  - Missing features
  - Switched to competitor
  - No longer needed
  - Other (with text input)
- **Retention Offers:** Phase 2 - show discount offer before cancellation

### Subscription Update Rules
**Upgrade (e.g., Starter → Professional):**
- **Proration:** Immediate proration (charge difference for remainder of period)
- **Effective Date:** Immediately
- **Credits:** Immediately allocate new tier's monthly credits

**Downgrade (e.g., Professional → Starter):**
- **Proration:** Credit applied to next invoice
- **Effective Date:** At end of current billing period
- **Credits:** Adjust at start of next billing period
- **Warning:** Show user warning if they have more queries tracked than new tier allows

---

## Webhooks

### Webhook Endpoint
- **URL:** `https://yourdomain.com/api/webhooks/stripe`
- **Events to Subscribe:**
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `customer.subscription.trial_will_end` (3 days before trial ends)
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `customer.updated`

### Webhook Handler Logic

#### Event: checkout.session.completed
**Purpose:** User completed checkout for new subscription or credit purchase

**Processing Steps:**
1. Retrieve checkout session details from Stripe
2. Verify session.mode:
   - If "subscription": Handle new subscription signup
   - If "payment": Handle credit top-up purchase

**For Subscription:**
3. Get or create customer in Supabase:
   - Use session.client_reference_id (user_id) to link to existing user
   - Or create new user if signup flow
4. Create subscription record in Supabase:
   - stripe_customer_id
   - stripe_subscription_id
   - plan_tier (from price metadata)
   - status: "trialing" or "active"
   - current_period_start, current_period_end
5. Allocate monthly credits:
   - Call Supabase function: `allocate_monthly_credits(user_id)`
   - Sets credits based on plan tier metadata
6. Create credit_transaction record: type="monthly_allocation"
7. Send welcome email via n8n or email service

**For Credit Top-Up:**
3. Extract credit_amount from price metadata
4. Add to user's bonus_credits in credits table
5. Create credit_transaction record: type="bonus"

---

#### Event: customer.subscription.updated
**Purpose:** Subscription was modified (upgrade, downgrade, reactivation)

**Processing Steps:**
1. Fetch subscription from Stripe API for full details
2. Identify change type:
   - Plan change (items.data[0].price.id changed)
   - Status change (active → past_due → active)
   - Quantity change (if implementing seat-based pricing in Phase 2)
3. Update subscriptions table in Supabase:
   - New plan_tier
   - New status
   - New current_period_start/end
   - cancel_at_period_end flag
4. If plan changed:
   - Adjust credits immediately (if upgrade)
   - Schedule credit adjustment (if downgrade at period end)
5. Send notification to user about change

---

#### Event: customer.subscription.deleted
**Purpose:** Subscription was canceled

**Processing Steps:**
1. Update subscriptions table:
   - status = "canceled"
2. Preserve remaining credits until period end
3. Stop scheduled ranking updates after period ends
4. Send cancellation confirmation email
5. Optionally: Schedule follow-up feedback request (3 days later)

---

#### Event: customer.subscription.trial_will_end
**Purpose:** Trial ending in 3 days

**Processing Steps:**
1. Check if user has payment method on file
2. If no payment method:
   - Send reminder email to add payment method
   - Show in-app banner
3. If payment method exists:
   - Send friendly reminder about trial ending
   - Highlight value they've received during trial

---

#### Event: invoice.payment_succeeded
**Purpose:** Monthly/annual payment succeeded

**Processing Steps:**
1. Update subscriptions table:
   - current_period_start = invoice.period_start
   - current_period_end = invoice.period_end
   - status = "active"
2. Allocate monthly credits:
   - Calculate rollover (20% of unused)
   - Reset monthly_allocation
   - Call `allocate_monthly_credits(user_id)`
3. Create credit_transaction: type="monthly_allocation"
4. Send receipt email (Stripe auto-sends, optionally customize)

---

#### Event: invoice.payment_failed
**Purpose:** Payment failed (card declined, insufficient funds, etc.)

**Processing Steps:**
1. Update subscriptions table:
   - status = "past_due"
2. Retry payment (Stripe Smart Retries handles this automatically)
3. Send payment failure email to user:
   - Link to update payment method
   - Mention grace period (Stripe default: 7 days)
4. Pause AI agent access if payment not resolved in 7 days
5. Show in-app alert: "Payment failed - update payment method"

---

### Webhook Security
- **Verify Signature:** Always verify stripe-signature header
- **Use Raw Body:** Parse webhook with raw request body (not JSON parsed)
- **Return 200 Quickly:** Acknowledge webhook within 3 seconds
- **Process Async:** Queue webhook processing for complex operations
- **Idempotency:** Check event.id to prevent duplicate processing

**Example Verification (Node.js):**
```javascript
const signature = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  request.body, // raw body
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

## API Routes to Implement

### 1. POST /api/stripe/create-checkout-session
**Purpose:** Create Checkout session for subscription or credits

**Request Body:**
```json
{
  "priceId": "price_professional_monthly",
  "userId": "uuid",
  "email": "user@example.com",
  "mode": "subscription" // or "payment" for credits
}
```

**Logic:**
1. Validate user authenticated (check session)
2. Check if user already has active subscription (prevent duplicate)
3. Create Stripe Checkout Session:
   - price: priceId
   - customer_email: email (if new customer)
   - customer: existing Stripe customer_id (if exists)
   - client_reference_id: userId (to link back)
   - mode: subscription or payment
   - allow_promotion_codes: true
   - subscription_data.trial_period_days: 14 (for subscriptions)
4. Return checkout session URL

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

---

### 2. POST /api/stripe/create-portal-session
**Purpose:** Create Customer Portal session for managing subscription

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Logic:**
1. Validate user authenticated
2. Get user's stripe_customer_id from Supabase
3. Create Stripe Billing Portal Session:
   - customer: stripe_customer_id
   - return_url: https://yourdomain.com/dashboard/settings
4. Return portal URL

**Response:**
```json
{
  "portalUrl": "https://billing.stripe.com/p/session/..."
}
```

---

### 3. GET /api/stripe/subscription-status
**Purpose:** Get current subscription and usage details for dashboard

**Query Params:**
- userId: uuid

**Logic:**
1. Validate user authenticated
2. Query Supabase subscriptions table
3. Get credit balance from credits table
4. Get current period usage from credit_transactions
5. Fetch upcoming invoice from Stripe (for amount due)

**Response:**
```json
{
  "subscription": {
    "plan_tier": "professional",
    "status": "active",
    "current_period_end": "2026-03-15T00:00:00Z",
    "cancel_at_period_end": false
  },
  "credits": {
    "total_credits": 320,
    "monthly_allocation": 500,
    "rollover_credits": 50,
    "bonus_credits": 20
  },
  "usage": {
    "credits_used_this_period": 180,
    "days_remaining": 12
  },
  "billing": {
    "next_invoice_amount": 199.00,
    "next_invoice_date": "2026-03-15"
  }
}
```

---

### 4. POST /api/stripe/upgrade-subscription
**Purpose:** Upgrade or downgrade subscription tier

**Request Body:**
```json
{
  "userId": "uuid",
  "newPriceId": "price_enterprise_monthly"
}
```

**Logic:**
1. Validate user authenticated
2. Get current subscription from Supabase
3. Fetch subscription from Stripe API
4. Update subscription:
   - items: [{id: subscription_item_id, price: newPriceId}]
   - proration_behavior: "always_invoice" (for upgrades)
   - billing_cycle_anchor: "now" or "unchanged" (for downgrades)
5. If downgrade: set proration_behavior to "create_prorations"
6. Stripe webhook will handle Supabase updates

**Response:**
```json
{
  "success": true,
  "message": "Subscription updated to Enterprise",
  "effective_date": "immediately" // or "2026-03-15"
}
```

---

## Testing Strategy

### Test Mode
- Use Stripe test mode for all development
- Test cards:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`
  - 3D Secure: `4000 0027 6000 3184`

### Test Scenarios
1. **New Subscription:**
   - Complete checkout with trial
   - Verify credits allocated in Supabase
   - Verify subscription record created

2. **Trial Conversion:**
   - Fast-forward trial end (Stripe Dashboard)
   - Verify payment processed
   - Verify credits refreshed

3. **Failed Payment:**
   - Use decline test card
   - Verify subscription status = "past_due"
   - Verify retry emails sent

4. **Upgrade:**
   - Upgrade from Starter to Professional
   - Verify immediate proration charge
   - Verify credits adjusted

5. **Downgrade:**
   - Downgrade from Professional to Starter
   - Verify change scheduled for period end
   - Verify credits not adjusted yet

6. **Cancellation:**
   - Cancel subscription
   - Verify access continues until period end
   - Verify subscription status = "canceled"

7. **Credit Purchase:**
   - Complete checkout for credit top-up
   - Verify bonus_credits updated in Supabase

8. **Webhook Reliability:**
   - Simulate webhook failures
   - Verify Stripe retries
   - Test idempotency (duplicate webhook events)

---

## Error Handling

### Checkout Errors
- **Card Declined:** Show user-friendly message, suggest retry or different card
- **Expired Card:** Prompt to enter new card details
- **Invalid Coupon:** Clear error message in checkout
- **User Already Subscribed:** Redirect to Customer Portal instead

### Webhook Errors
- **Return 200 immediately** even if processing fails
- Log error to monitoring system
- Queue for manual review
- Implement dead letter queue for repeated failures

### Payment Failures
- **Stripe Smart Retries:** Automatically retry failed payments (default schedule)
- **Grace Period:** 7 days before restricting access
- **User Communications:**
  - Day 0: Payment failed, please update
  - Day 3: Reminder - payment still pending
  - Day 7: Final notice - access will be suspended
  - Day 8: Access suspended, prompt to resolve

---

## Subscription Lifecycle Diagram

```
1. User Clicks "Start Free Trial"
   ↓
2. Create Checkout Session (POST /api/stripe/create-checkout-session)
   ↓
3. Redirect to Stripe Checkout
   ↓
4. User Enters Payment Info
   ↓
5. Checkout Complete → Webhook: checkout.session.completed
   ↓
6. Create Subscription Record in Supabase
   ↓
7. Allocate Trial Credits (full monthly amount)
   ↓
8. Start Trial Period (14 days)
   ↓
9. [Day 11] Webhook: customer.subscription.trial_will_end
   ↓
10. Send Reminder Email
   ↓
11. [Day 14] Trial Ends → Attempt First Payment
    ↓
12. Payment Succeeds → Webhook: invoice.payment_succeeded
    ↓
13. Subscription status = "active"
    ↓
14. [Monthly] Recurring Invoice Created
    ↓
15. Payment Succeeds → Webhook: invoice.payment_succeeded
    ↓
16. Allocate New Monthly Credits (with 20% rollover)
    ↓
17. Repeat Monthly Cycle...

--- OR ---

11. [Day 14] Trial Ends → Payment Fails
    ↓
12. Webhook: invoice.payment_failed
    ↓
13. Subscription status = "past_due"
    ↓
14. Stripe Smart Retries (over 7 days)
    ↓
15a. Payment Succeeds → Continue as above
15b. Payment Still Fails → Subscription canceled

--- OR ---

User Clicks "Cancel Subscription"
    ↓
Cancel via Customer Portal
    ↓
Subscription.cancel_at_period_end = true
    ↓
[End of Period] Webhook: customer.subscription.deleted
    ↓
Access ends, credits remain until period end
```

---

## Compliance & Security

### PCI Compliance
- **Never handle raw card data** - always use Stripe Checkout or Elements
- **Use HTTPS** for all API endpoints
- **Secure Webhook Secret** - store in environment variables

### GDPR
- **Data Retention:** Store only necessary billing data
- **Right to Deletion:** Implement user data export and deletion
- **Privacy Policy:** Link in checkout and portal

### Fraud Prevention
- **Stripe Radar:** Enable (automatic fraud detection)
- **3D Secure:** Enable for European cards
- **Decline Thresholds:** Set up rules for suspicious activity

---

## Monitoring & Alerts

### Stripe Dashboard
- Monitor daily: Revenue, Failed Payments, Churn Rate
- Set up alerts for:
  - Unusual number of failed payments
  - Spike in cancellations
  - Webhook endpoint failures

### Key Metrics to Track
- **MRR (Monthly Recurring Revenue)**
- **Churn Rate** (subscriptions canceled / total subscriptions)
- **ARPU (Average Revenue Per User)**
- **Trial Conversion Rate**
- **Payment Failure Rate**
- **Credit Usage Rate** (avg credits used / allocated)

---

## Environment Variables Required

```
# Stripe Keys
STRIPE_PUBLIC_KEY=pk_test_... (test) or pk_live_... (production)
STRIPE_SECRET_KEY=sk_test_... (test) or sk_live_... (production)
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (create in Stripe Dashboard)
PRICE_STARTER_MONTHLY=price_...
PRICE_STARTER_ANNUAL=price_...
PRICE_PROFESSIONAL_MONTHLY=price_...
PRICE_PROFESSIONAL_ANNUAL=price_...
PRICE_ENTERPRISE_MONTHLY=price_...
PRICE_ENTERPRISE_ANNUAL=price_...
PRICE_CREDITS_50=price_...
PRICE_CREDITS_100=price_...
PRICE_CREDITS_500=price_...

# URLs
NEXT_PUBLIC_BASE_URL=https://yourdomain.com (for redirect URLs)
```

---

## Deployment Checklist

- [ ] Create products and prices in Stripe Dashboard
- [ ] Configure Checkout settings (trial, payment methods)
- [ ] Configure Customer Portal settings
- [ ] Set up webhook endpoint and subscribe to events
- [ ] Test all webhook events in test mode
- [ ] Verify webhook signature verification works
- [ ] Test complete subscription lifecycle
- [ ] Enable Stripe Radar for fraud prevention
- [ ] Set up email notifications in Stripe
- [ ] Configure tax settings (if applicable)
- [ ] Migrate test products to production
- [ ] Update environment variables for production
- [ ] Monitor first 10 production transactions closely

---

## Notes for Claude Code

**Integration Approach:**
- Use Stripe official SDK (@stripe/stripe-js for frontend, stripe for backend)
- Never expose secret key to frontend (only use public key)
- Always verify webhooks to prevent spoofing
- Handle webhook events idempotently (same event may arrive multiple times)

**Credit Allocation Logic:**
- Trigger credit allocation on `invoice.payment_succeeded` webhook
- Calculate rollover: `min(unused_credits * 0.2, monthly_allocation * 0.5)`
- Store all credit changes in credit_transactions for audit trail
- Never allow negative credit balance (check before deduction)

**Subscription Updates:**
- Upgrades: Immediate proration and credit adjustment
- Downgrades: Scheduled for period end, warn user about feature restrictions
- Cancellations: Soft delete (keep access until period end)

**Error Recovery:**
- If webhook processing fails, log to database and alert
- Implement admin dashboard to manually sync Stripe ↔ Supabase
- Create Stripe webhook event replay tool for failed events

**This specification provides complete Stripe integration requirements. Claude Code should implement the API routes, webhook handler, and ensure proper error handling and security throughout the payment flow.**
