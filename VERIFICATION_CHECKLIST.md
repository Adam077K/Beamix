# GEO Platform - Verification Checklist
## Quality Gates, Testing Requirements & Definition of Done

**Version:** 1.0  
**Created:** February 14, 2026  
**Purpose:** Define what "done" means for each phase and the complete MVP

---

## Overview

This document establishes the criteria that must be met before:
1. Moving from one phase to the next
2. Deploying to staging
3. Deploying to production
4. Declaring MVP complete

**Philosophy:** "Works on my machine" is not done. Done means verified, tested, documented, and deployed.

---

## Phase Gates

### Phase 0 Gate: Foundation Complete

**Must Complete Before Phase 1 Begins:**

#### Database ✅
- [ ] All 12 tables exist in Supabase
- [ ] All 5 database functions work correctly
- [ ] All 8 triggers fire as expected
- [ ] RLS enabled on all 12 tables
- [ ] RLS policies tested with 3+ user contexts
- [ ] Migration files version-controlled and documented

**Verification Command:**
```bash
# Check all tables exist
psql $DATABASE_URL -c "\dt" | grep -E "users|subscriptions|credits|credit_transactions|tracked_queries|llm_rankings|recommendations|content_generations|competitor_tracking|competitor_mentions|agent_executions|notification_preferences"
# Should show all 12 tables

# Test RLS
psql $DATABASE_URL -f test_rls.sql
# Should pass all assertions
```

#### Environment Setup ✅
- [ ] `.env.local` has all 20+ required variables
- [ ] All API keys tested and working
- [ ] Supabase connection verified
- [ ] Stripe test mode configured
- [ ] n8n Cloud accessible

**Verification Command:**
```bash
cd saas-platform
npm run dev
curl http://localhost:3000/api/health
# Should return {"status":"ok","db":"connected","services":["supabase","stripe","n8n"]}
```

#### Dependencies ✅
- [ ] React Query installed and provider configured
- [ ] Zustand installed and working
- [ ] Shadcn UI installed (10+ components)
- [ ] All npm packages installed without errors
- [ ] TypeScript compiles without errors

**Verification Command:**
```bash
cd saas-platform
npm run build
# Should complete without errors
# Build time should be <60 seconds
```

#### n8n Setup ✅
- [ ] n8n Cloud workspace accessible
- [ ] All 5 LLM credentials configured and tested
- [ ] Supabase credential configured (service role)
- [ ] 7 workflow shells created with unique webhook URLs
- [ ] Webhook URLs added to `.env.local`

**Verification:**
- [ ] Can trigger each webhook with curl (returns 200 OK)

---

### Phase 1 Gate: Core Backend Complete

**Must Complete Before Phase 2 Begins:**

#### API Layer ✅
- [ ] All Phase 1 API routes implemented:
  - `/api/dashboard/overview` ✅
  - `/api/queries` (GET, POST) ✅
  - `/api/queries/[id]` (PUT, DELETE) ✅
  - `/api/queries/trigger-analysis` ✅
  - `/api/credits/balance` ✅
  - `/api/credits/transactions` ✅
- [ ] All routes require authentication
- [ ] All routes return standardized error responses
- [ ] All routes validated with integration tests

**Verification Command:**
```bash
# Run integration tests
npm run test:integration
# Should pass all API route tests

# Manual smoke test
./scripts/test_api_routes.sh
# Should test each endpoint with valid auth token
```

#### Dashboard UI ✅
- [ ] Dashboard page renders without errors
- [ ] 4 metric cards display real data from API
- [ ] Chart shows LLM breakdown
- [ ] Trend indicators work (↑↓→)
- [ ] Loading states show while fetching
- [ ] Error states show on API failure
- [ ] Empty state shows if no data
- [ ] Mobile responsive (tested on 3 breakpoints)

**Verification:**
```bash
# Run Lighthouse audit
npm run lighthouse http://localhost:3000/dashboard
# Scores:
# Performance: >90
# Accessibility: >95
# Best Practices: >95
# SEO: >90
```

#### Query Management ✅
- [ ] Queries page displays table of tracked queries
- [ ] "Add Query" modal works (form validation, submission)
- [ ] Edit query works (inline or modal)
- [ ] Delete query works (with confirmation)
- [ ] Toggle active/inactive works
- [ ] Optimistic updates work (immediate UI feedback)

**Verification:**
- [ ] Manually test all CRUD operations
- [ ] Run E2E test for query management flow

#### Initial Analysis Workflow ✅
- [ ] n8n workflow `01-initial-analysis` complete
- [ ] Workflow generates 15-20 queries using GPT-4o
- [ ] Workflow checks 4 LLMs in parallel
- [ ] Workflow stores rankings in `llm_rankings` table
- [ ] Workflow generates recommendations
- [ ] Workflow completes in <10 minutes
- [ ] Error handling works (retry logic tested)

**Verification:**
```bash
# Trigger workflow manually
curl -X POST $N8N_INITIAL_ANALYSIS_WEBHOOK \
  -H "Content-Type: application/json" \
  -d '{"business_id":"test-uuid","industry":"relocation_services","location":"Tel Aviv"}'

# Check n8n execution log (should be success)
# Check database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM llm_rankings WHERE business_id = 'test-uuid';"
# Should return 60-80 rows
```

**Phase 1 Success Criteria:**
- [ ] User can sign up, add queries, see rankings
- [ ] Dashboard displays real-time data
- [ ] Initial analysis workflow runs end-to-end

---

### Phase 2 Gate: Billing & Credits Complete

**Must Complete Before Phase 3 Begins:**

#### Stripe Integration ✅
- [ ] 3 subscription products created in Stripe
- [ ] Checkout session API works
- [ ] Stripe webhook handler deployed
- [ ] All 6 webhook events handled:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Webhook signature verification working
- [ ] Idempotency keys implemented

**Verification Command:**
```bash
# Test checkout flow
npm run test:stripe-checkout

# Test webhook handler
stripe listen --forward-to localhost:3000/api/stripe/webhooks
stripe trigger checkout.session.completed
# Check logs: webhook received, subscription created, credits allocated
```

#### Credit System ✅
- [ ] Credit allocation on subscription creation works
- [ ] Credit deduction on agent execution works
- [ ] Credit transactions logged correctly
- [ ] Credit balance API accurate
- [ ] Insufficient credits prevents agent execution
- [ ] Credits display in dashboard header
- [ ] Warning shown when credits <20%

**Verification:**
```bash
# Test credit flow
psql $DATABASE_URL <<EOF
-- Allocate credits
SELECT allocate_monthly_credits('user-uuid', 'professional');
SELECT credits_remaining FROM credits WHERE user_id = 'user-uuid';
-- Should be 500

-- Deduct credits
SELECT deduct_credits('user-uuid', 3);
SELECT credits_remaining FROM credits WHERE user_id = 'user-uuid';
-- Should be 497

-- Check transactions
SELECT * FROM credit_transactions WHERE user_id = 'user-uuid' ORDER BY created_at DESC LIMIT 2;
-- Should show 1 allocation + 1 deduction
EOF
```

#### Pricing & Billing UI ✅
- [ ] Pricing page displays 3 tiers with features
- [ ] Checkout button redirects to Stripe Checkout
- [ ] Success page shows after payment
- [ ] Credits widget in header shows balance
- [ ] Settings → Billing shows subscription info
- [ ] Customer portal link works (Stripe-hosted)
- [ ] Can upgrade/downgrade subscription

**Verification:**
- [ ] Complete full checkout flow (test card: 4242 4242 4242 4242)
- [ ] Verify subscription in Stripe Dashboard
- [ ] Verify credits allocated in database
- [ ] Test customer portal (cancel subscription, update payment)

**Phase 2 Success Criteria:**
- [ ] User can subscribe and receive credits
- [ ] Credits deducted on agent use
- [ ] Stripe webhooks reliable (tested with 10+ events)

---

### Phase 3 Gate: AI Agents Complete

**Must Complete Before Phase 4 Begins:**

#### Content Writer Agent ✅
- [ ] n8n workflow `02-content-writer-agent` complete
- [ ] Workflow performs competitor analysis
- [ ] Workflow researches topic with Perplexity
- [ ] Workflow generates outline with Claude
- [ ] Workflow writes full content with Claude
- [ ] Workflow performs quality check with GPT-4o
- [ ] Output is 800-1,500 words
- [ ] Content optimized for LLM citation
- [ ] Credits deducted correctly (3 credits)
- [ ] Execution time <5 minutes

**Verification:**
```bash
# Test Content Writer
curl -X POST /api/agents/content-writer \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Best relocation services in Tel Aviv",
    "content_type": "article",
    "tone": "professional",
    "length": "medium"
  }'

# Wait for completion, check output
psql $DATABASE_URL -c "SELECT * FROM content_generations WHERE agent_type = 'content_writer' ORDER BY created_at DESC LIMIT 1;"
# Should have output_content with 800-1,500 words
```

#### Competitor Research Agent ✅
- [ ] n8n workflow `03-competitor-research-agent` complete
- [ ] Workflow fetches competitor rankings
- [ ] Workflow analyzes competitor content
- [ ] Workflow generates actionable insights
- [ ] Output includes 5+ recommendations
- [ ] Credits deducted correctly (2 credits)
- [ ] Execution time <5 minutes

**Verification:**
- [ ] Test with 2 different competitors
- [ ] Verify analysis quality (manual review)
- [ ] Check credits deducted

#### Query Researcher Agent ✅
- [ ] n8n workflow `04-query-researcher-agent` complete
- [ ] Workflow generates 30-50 query suggestions
- [ ] Workflow tests 10-15 queries against LLMs
- [ ] Workflow ranks queries by relevance
- [ ] Output includes priority levels
- [ ] Credits deducted correctly (1 credit)
- [ ] Execution time <5 minutes

**Verification:**
- [ ] Test with 3 different industries
- [ ] Verify queries are relevant
- [ ] Check no duplicate queries returned

#### Agent UI ✅
- [ ] Content Writer modal works (3 states: input, loading, success)
- [ ] Competitor Research modal works
- [ ] Query Researcher modal works
- [ ] Loading states show progress (visual feedback)
- [ ] Success states show output (readable, copyable)
- [ ] Error states handled gracefully
- [ ] Content history page lists all generated content
- [ ] Can download content as Markdown or copy to clipboard

**Verification:**
- [ ] Execute each agent through UI
- [ ] Test all error scenarios (insufficient credits, API failure)
- [ ] Verify UX smooth and intuitive

#### Recommendations ✅
- [ ] n8n workflow `06-recommendation-generator` complete
- [ ] Workflow analyzes ranking data
- [ ] Workflow identifies content gaps
- [ ] Workflow generates 5-10 recommendations
- [ ] Each recommendation has: Action, Impact, Effort, Why
- [ ] Recommendations have one-click execution buttons
- [ ] Clicking button pre-fills agent modal

**Verification:**
- [ ] Trigger recommendation generator manually
- [ ] Verify recommendations are actionable
- [ ] Click "Generate Article" button on recommendation
- [ ] Verify Content Writer modal opens with topic pre-filled

**Phase 3 Success Criteria:**
- [ ] All 3 agents work end-to-end
- [ ] Recommendations actionable and useful
- [ ] User can execute agent in <3 clicks

---

### Phase 4 Gate: Polish & Integration Complete

**Must Complete Before Phase 5 Begins:**

#### Feature Completeness ✅
- [ ] Competitor comparison working
  - Add competitor works
  - Side-by-side comparison chart displays
  - Competitor rankings fetched
- [ ] Settings page complete
  - Profile tab (business info editable)
  - Notifications tab (preferences)
  - Billing tab (subscription, portal link)
  - Competitors tab (manage competitors)
- [ ] All email templates configured in Supabase
  - Welcome email
  - Password reset
  - Subscription confirmation
  - Low credits warning (Phase 2)

**Verification:**
- [ ] Manually test each feature
- [ ] Verify all settings save correctly
- [ ] Send test emails

#### UX Polish ✅
- [ ] All pages have error boundaries
- [ ] All API calls have loading states
- [ ] All empty states have helpful CTAs
- [ ] All forms have validation and error messages
- [ ] All modals can be dismissed (X button, ESC key, click outside)
- [ ] All tables have pagination or virtualization
- [ ] All charts have tooltips and legends
- [ ] All buttons have hover states and disabled states

**Verification:**
- [ ] Run UX audit script
```bash
python .claude/skills/frontend-design/scripts/ux_audit.py saas-platform/src
# fallback: python .agent/skills/frontend-design/scripts/ux_audit.py saas-platform/src
# Should pass all checks
```

#### Mobile Responsiveness ✅
- [ ] All pages tested on 3 breakpoints (mobile, tablet, desktop)
- [ ] Navigation works on mobile (hamburger menu)
- [ ] Forms usable on mobile (input sizes, keyboard)
- [ ] Charts responsive (scale or hide on mobile)
- [ ] Modals full-screen on mobile
- [ ] Touch targets ≥44x44px

**Verification:**
```bash
# Test on real devices or emulators
# iOS: iPhone 12, iPhone SE
# Android: Pixel 5, Galaxy S21
# Tablets: iPad Air, Galaxy Tab

# Automated responsive test
npm run test:responsive
```

#### Accessibility ✅
- [ ] WCAG AA compliance
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] All interactive elements keyboard-accessible
- [ ] Focus indicators visible
- [ ] Color contrast ≥4.5:1
- [ ] Screen reader tested (NVDA or VoiceOver)

**Verification:**
```bash
# Run accessibility audit
npm run lighthouse http://localhost:3000/dashboard
# Accessibility score: >95

# Manual screen reader test
# Use NVDA (Windows) or VoiceOver (Mac)
# Navigate entire app using only keyboard
```

**Phase 4 Success Criteria:**
- [ ] App feels polished and professional
- [ ] No obvious bugs or UX issues
- [ ] Mobile experience excellent

---

### Phase 5 Gate: Production Ready

**Must Complete Before Production Deployment:**

#### Testing ✅
- [ ] E2E test suite passes (50+ scenarios)
  - Auth flows (signup, login, logout, password reset)
  - Dashboard (metrics display, query management)
  - Agent execution (all 3 agents)
  - Billing (checkout, credits, subscription)
  - Settings (profile, notifications, billing)
- [ ] Integration tests pass (all API routes)
- [ ] Unit tests pass (critical functions)
- [ ] Test coverage >80% for critical paths

**Verification Command:**
```bash
# Run full test suite
npm run test
npm run test:integration
npm run test:e2e

# Check coverage
npm run test:coverage
# Critical paths (auth, billing, agents) must be >80%
```

#### Security ✅
- [ ] Security scan passes (no critical vulnerabilities)
- [ ] RLS tested with multiple user contexts
- [ ] API endpoints require authentication
- [ ] Stripe webhooks verify signatures
- [ ] No secrets in client-side code
- [ ] CORS configured correctly
- [ ] CSP headers configured
- [ ] Rate limiting implemented for public endpoints

**Verification Command:**
```bash
# Security scan
npm audit
# Should have 0 high or critical vulnerabilities

# Run security script
python .claude/skills/vulnerability-scanner/scripts/security_scan.py saas-platform
# fallback: python .agent/skills/vulnerability-scanner/scripts/security_scan.py saas-platform
# Should pass all checks

# Test RLS
./scripts/test_rls.sh
# Should pass all assertions
```

#### Performance ✅
- [ ] Lighthouse scores >90 (all categories)
- [ ] API response time <200ms (p95)
- [ ] Dashboard loads <2 seconds
- [ ] Agent execution <5 minutes
- [ ] No CLS (Cumulative Layout Shift)
- [ ] LCP <2.5s (Largest Contentful Paint)
- [ ] FID <100ms (First Input Delay)

**Verification Command:**
```bash
# Run Lighthouse audit
npm run lighthouse http://localhost:3000/dashboard

# Run performance benchmarks
npm run benchmark
# Should meet all targets

# Load test (optional but recommended)
python .claude/skills/performance-profiling/scripts/load_test.py http://localhost:3000
# fallback: python .agent/skills/performance-profiling/scripts/load_test.py http://localhost:3000
# Should handle 100 concurrent users
```

#### Documentation ✅
- [ ] README complete with setup instructions
- [ ] API documentation generated (Swagger/OpenAPI)
- [ ] Environment variables documented
- [ ] Database schema documented
- [ ] n8n workflows documented
- [ ] Deployment guide complete
- [ ] Troubleshooting guide complete

**Verification:**
- [ ] New developer can set up project using README alone
- [ ] All API endpoints documented with examples
- [ ] All env vars explained

#### Monitoring & Logging ✅
- [ ] Sentry configured for error tracking
- [ ] Vercel Analytics configured
- [ ] Custom logging for critical paths:
  - Agent executions
  - Credit transactions
  - Stripe webhooks
  - LLM API calls
- [ ] Alerts configured for:
  - API errors (>5% error rate)
  - Agent failures (>10% failure rate)
  - Database connection issues
  - Stripe webhook failures

**Verification:**
- [ ] Trigger test error → appears in Sentry
- [ ] Check Vercel Analytics dashboard → metrics showing
- [ ] Review logs for critical events

#### Deployment Checklist ✅
- [ ] Environment variables configured in Vercel
- [ ] Database migrations applied to production
- [ ] Stripe products created in production mode
- [ ] n8n workflows deployed to production workspace
- [ ] DNS configured (if custom domain)
- [ ] SSL certificate active
- [ ] Backup strategy in place
- [ ] Rollback plan documented

**Phase 5 Success Criteria:**
- [ ] All tests pass
- [ ] Security scan clean
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Monitoring active

---

## MVP Complete Checklist

### Feature Completeness

#### Authentication ✅
- [ ] User can sign up with email/password
- [ ] User receives verification email
- [ ] User can log in
- [ ] User can reset password
- [ ] Protected routes redirect to login
- [ ] Session persists across page refreshes
- [ ] User can log out

#### Onboarding ✅
- [ ] User completes onboarding form (business info)
- [ ] Initial Analysis automatically triggers
- [ ] User sees "Analyzing..." progress indicator
- [ ] Analysis completes in <10 minutes
- [ ] User redirected to dashboard after completion

#### Dashboard ✅
- [ ] Displays 4 core metrics (ranking, mentions, citations, trend)
- [ ] Chart shows LLM breakdown
- [ ] Data refreshes on page visit
- [ ] Date range filter works (7d, 30d, 90d)
- [ ] Mobile responsive

#### Query Management ✅
- [ ] User can view tracked queries
- [ ] User can add custom queries
- [ ] User can edit queries
- [ ] User can delete queries
- [ ] User can toggle active/inactive

#### Competitor Comparison ✅
- [ ] User can add competitors
- [ ] Dashboard shows side-by-side comparison
- [ ] Competitor rankings displayed

#### AI Agents ✅
- [ ] Content Writer works (generates articles)
- [ ] Competitor Research works (analysis reports)
- [ ] Query Researcher works (query suggestions)
- [ ] All agents deduct credits correctly
- [ ] All agents complete in <5 minutes
- [ ] Content downloadable/copyable

#### Recommendations ✅
- [ ] Dashboard shows 5-10 recommendations
- [ ] Each recommendation has: Action, Impact, Effort
- [ ] One-click buttons work (pre-fill agent modals)
- [ ] User can mark recommendations as Done or Dismiss

#### Billing & Credits ✅
- [ ] User can view pricing page
- [ ] User can subscribe (Stripe Checkout)
- [ ] Credits allocated on subscription
- [ ] Credits displayed in header
- [ ] Credits deducted on agent use
- [ ] User can view credit transactions
- [ ] User can access customer portal
- [ ] User can upgrade/downgrade subscription

#### Settings ✅
- [ ] User can edit profile (business info)
- [ ] User can configure notifications (email preferences)
- [ ] User can view billing info
- [ ] User can manage competitors

### Technical Requirements ✅
- [ ] All 12 database tables exist
- [ ] All RLS policies working
- [ ] All 25+ API routes working
- [ ] All 7 n8n workflows working
- [ ] Stripe webhooks reliable
- [ ] Authentication secure
- [ ] Performance benchmarks met
- [ ] Security scan clean

### User Experience ✅
- [ ] App is intuitive (new user can navigate without docs)
- [ ] No broken links or 404s
- [ ] No console errors in browser
- [ ] Loading states everywhere
- [ ] Error messages helpful
- [ ] Mobile experience good
- [ ] Accessibility (WCAG AA)

---

## Definition of Done

### For Individual Tasks

A task is "done" when:
1. ✅ **Code written** - Implementation complete per spec
2. ✅ **Tests written** - Unit/integration tests pass
3. ✅ **Code reviewed** - Another agent reviewed (if applicable)
4. ✅ **Documentation updated** - README, API docs, comments
5. ✅ **Verified** - Ran verification command from task spec
6. ✅ **Deployed to staging** - Working in staging environment
7. ✅ **Accepted** - Product Manager approved (for features)

### For Features

A feature is "done" when:
1. ✅ All tasks for feature completed (per above)
2. ✅ E2E test passes for feature
3. ✅ Acceptance criteria met (from PRD)
4. ✅ UX review passed (product-manager approval)
5. ✅ No critical bugs
6. ✅ Works on mobile
7. ✅ Accessible (WCAG AA)

### For MVP

MVP is "done" when:
1. ✅ All P0 features complete
2. ✅ All Phase 5 gates passed
3. ✅ Production deployment successful
4. ✅ Monitoring active
5. ✅ Documentation complete
6. ✅ 3 pilot users tested successfully (Week 3)
7. ✅ Product Owner sign-off

---

## Testing Strategy

### Test Pyramid

```
         E2E Tests (50 scenarios)
              /\
             /  \
            /    \
           /      \
          /--------\
         / Integration Tests (100+ tests)
        /------------\
       /              \
      /                \
     /------------------\
    /   Unit Tests (200+ tests)
   /----------------------\
```

### Test Coverage Requirements

| Area | Coverage Target | Why |
|------|----------------|-----|
| **Auth logic** | 90% | Critical security |
| **Billing logic** | 95% | Financial impact |
| **Credit system** | 95% | Financial impact |
| **Agent APIs** | 80% | Core product value |
| **Database functions** | 100% | Data integrity |
| **Webhook handlers** | 90% | External dependencies |
| **UI components** | 60% | Balance effort/value |
| **Utility functions** | 80% | High reuse |

### E2E Test Scenarios

#### Authentication (8 scenarios)
1. Sign up with valid email/password → verify email → login
2. Sign up with existing email → error message
3. Login with valid credentials → dashboard
4. Login with invalid password → error message
5. Password reset flow → receive email → set new password
6. Access protected route without auth → redirect to login
7. Logout → clear session → redirect to home
8. Session expires → redirect to login

#### Dashboard (10 scenarios)
9. View dashboard → see 4 metrics
10. Change date range → metrics update
11. Dashboard with no data → empty state
12. Dashboard API error → error message
13. Add query → appears in list
14. Edit query → updates immediately
15. Delete query → confirmation → removed
16. Add competitor → appears in comparison
17. Mobile dashboard → responsive layout
18. Refresh dashboard → data updates

#### AI Agents (12 scenarios)
19. Execute Content Writer → credits deducted → article generated
20. Execute Content Writer with insufficient credits → error
21. Execute Competitor Research → report generated
22. Execute Query Researcher → suggestions returned
23. Content Writer modal → fill form → submit → loading → success
24. Agent execution failure → error message → credits refunded
25. View content history → list of generated content
26. Download content as Markdown → file downloaded
27. Copy content to clipboard → copied
28. Execute agent from recommendation → modal pre-filled
29. Multiple agent executions in parallel → all succeed
30. Agent execution timeout (>5 min) → error handling

#### Billing (15 scenarios)
31. View pricing page → 3 tiers displayed
32. Click subscribe (Starter) → Stripe Checkout
33. Complete checkout (test card) → success page
34. Stripe webhook received → subscription created
35. Credits allocated after payment → balance updated
36. View credit balance → correct amount
37. View credit transactions → list of transactions
38. Upgrade subscription → Stripe Customer Portal
39. Downgrade subscription → prorated credit
40. Cancel subscription → access until end of period
41. Payment fails → invoice.payment_failed webhook → notification
42. Credit pack purchase → credits added
43. Monthly credit reset → allocate_monthly_credits runs
44. Low credits warning (<20%) → notification shown
45. Insufficient credits → agent execution blocked

#### Settings (5 scenarios)
46. Edit profile → save → updated
47. Configure notifications → save → updated
48. View billing info → subscription details
49. Manage competitors → add/remove
50. Access customer portal → Stripe portal opens

### Load Testing

**Scenarios:**
- 100 concurrent users browsing dashboard
- 50 concurrent agent executions
- 1000 API requests per minute
- Stripe webhook burst (10 events in 1 second)

**Success Criteria:**
- API response time <500ms (p95) under load
- No 500 errors
- No database connection timeouts
- Agent execution time <6 minutes under load

---

## Monitoring & Alerts

### Metrics to Monitor

#### Application Health
- [ ] API uptime (target: 99.9%)
- [ ] API error rate (alert if >5%)
- [ ] API response time (alert if p95 >500ms)
- [ ] Database connection pool (alert if >80% utilization)

#### Business Metrics
- [ ] Agent execution success rate (alert if <90%)
- [ ] Agent execution time (alert if avg >5min)
- [ ] Stripe webhook processing (alert if any fail)
- [ ] Credit transactions (alert if any fail)
- [ ] User signups per day

#### Performance Metrics
- [ ] Lighthouse scores (weekly review)
- [ ] Core Web Vitals (LCP, FID, CLS)
- [ ] Bundle size (alert if >500KB)
- [ ] Page load time (alert if >3s)

### Alert Channels

| Alert Type | Severity | Channel | Response Time |
|-----------|----------|---------|---------------|
| API down | Critical | SMS + Email | 5 minutes |
| Error rate >10% | High | Email | 15 minutes |
| Agent failures >20% | High | Email | 30 minutes |
| Stripe webhook fail | High | Email | 30 minutes |
| Performance degradation | Medium | Email | 24 hours |
| Low disk space | Medium | Email | 24 hours |

---

## Pre-Launch Checklist

### 1 Week Before Launch

- [ ] All Phase 5 gates passed
- [ ] 3 pilot users completed testing
- [ ] Critical bugs fixed
- [ ] Performance benchmarks met
- [ ] Security audit complete
- [ ] Documentation complete
- [ ] Monitoring configured
- [ ] Backup strategy tested

### 3 Days Before Launch

- [ ] Production environment configured
- [ ] Database migrations applied to production
- [ ] Stripe products created in production mode
- [ ] n8n workflows deployed to production
- [ ] DNS configured (if custom domain)
- [ ] SSL certificate verified
- [ ] Final smoke test on production

### Day of Launch

- [ ] Deploy to production (off-peak hours)
- [ ] Verify deployment successful
- [ ] Run smoke tests on production
- [ ] Monitor for 2 hours post-deployment
- [ ] Announce launch
- [ ] Monitor for 24 hours

### Post-Launch (First Week)

- [ ] Daily monitoring (errors, performance, usage)
- [ ] User feedback collection
- [ ] Bug triage and fixes
- [ ] Performance optimization (if needed)
- [ ] Documentation updates based on feedback

---

## Rollback Plan

### When to Rollback

Rollback immediately if:
- Critical bug preventing core functionality (auth, billing, agents)
- Security vulnerability discovered
- Data integrity issue
- Performance degradation >50%
- Error rate >20%

### Rollback Procedure

1. **Identify issue** - Confirm rollback necessary
2. **Notify team** - Post in communication channel
3. **Rollback deployment** - Vercel: revert to previous deployment
4. **Verify rollback** - Run smoke tests
5. **Database rollback (if needed)** - Run reverse migration
6. **Monitor** - Confirm issue resolved
7. **Post-mortem** - Document what went wrong, prevent future

**Rollback Command:**
```bash
# Vercel CLI
vercel rollback production

# Database (if schema changed)
cd saas-platform
supabase migration repair
supabase db reset --db-url $PRODUCTION_DATABASE_URL
```

---

## Success Metrics

### Technical Success

- [ ] All tests pass
- [ ] Security scan clean
- [ ] Performance benchmarks met
- [ ] No critical bugs
- [ ] Monitoring active
- [ ] Documentation complete

### Product Success

- [ ] Users can complete onboarding in <5 minutes
- [ ] Users see initial rankings in <10 minutes
- [ ] Users can execute agents in <3 clicks
- [ ] Users can subscribe in <2 minutes
- [ ] Mobile experience rated >4/5 by pilot users

### Business Success (First 30 Days)

- [ ] 20+ paying customers
- [ ] $6,000+ MRR
- [ ] 75%+ retention (Month 1 → Month 2)
- [ ] <5% churn
- [ ] NPS >40

---

**Created:** February 14, 2026  
**Last Updated:** February 14, 2026  
**Status:** Ready for use  
**Next Review:** After each phase completion
