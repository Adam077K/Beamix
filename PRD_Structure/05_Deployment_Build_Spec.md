# Deployment & Operations Build Specification

## Overview
Complete deployment configuration, CI/CD pipeline, monitoring setup, and operational procedures for the GEO Platform. Primary hosting on Vercel with integrations to Supabase, n8n Cloud, and Stripe. Focus on production-ready deployment with proper security, monitoring, and scalability.

---

## Hosting Architecture

### Platform Overview
```
┌─────────────────┐
│   Vercel        │
│  (Frontend +    │──────┐
│   API Routes)   │      │
└─────────────────┘      │
                         │
┌─────────────────┐      │
│  Supabase       │◄─────┤
│  (Database +    │      │
│   Auth)         │      │
└─────────────────┘      │
                         │
┌─────────────────┐      │
│  n8n Cloud      │◄─────┤
│  (Workflows)    │      │
└─────────────────┘      │
                         │
┌─────────────────┐      │
│  Stripe         │◄─────┘
│  (Payments)     │
└─────────────────┘
```

---

## Vercel Configuration

### Project Setup
- **Framework Preset:** Next.js
- **Root Directory:** `/` (monorepo not required for MVP)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)
- **Node Version:** 20.x (latest LTS)

### Deployment Branches
1. **Production:**
   - Branch: `main`
   - Domain: `app.yourdomain.com` (custom domain)
   - Auto-deploy: Yes
   - Protection: Required approvals for merges

2. **Preview (Staging):**
   - Branch: `develop`
   - Domain: `staging-yourdomain.vercel.app`
   - Auto-deploy: Yes on push
   - For testing before production

3. **Feature Branches:**
   - Branch: `feature/*`
   - Domain: Auto-generated preview URLs
   - Auto-deploy: Yes on PR creation

### Build Settings
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Performance Optimizations
- **Edge Runtime:** Use for API routes where possible (faster cold starts)
- **Image Optimization:** Enabled by default (Next.js Image component)
- **Caching:**
  - Static assets: Cache-Control: public, max-age=31536000, immutable
  - API routes: Cache-Control: private, no-cache (default)
  - ISR pages: Revalidate every 60s for dashboard data
- **Bundle Analysis:** Enable webpack-bundle-analyzer for monitoring

---

## Environment Variables

### Vercel Environment Structure
Three environments: Production, Preview, Development

### Required Environment Variables

#### Supabase
```
# Public (can be exposed to frontend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (sensitive!)
SUPABASE_JWT_SECRET=your-jwt-secret (sensitive!)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project.supabase.co:5432/postgres
```

#### Stripe
```
# Public
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (production) or pk_test_... (preview/dev)

# Private
STRIPE_SECRET_KEY=sk_live_... (production) or sk_test_... (preview/dev) (sensitive!)
STRIPE_WEBHOOK_SECRET=whsec_... (sensitive!)

# Price IDs (different for test/prod)
PRICE_STARTER_MONTHLY=price_...
PRICE_STARTER_ANNUAL=price_...
PRICE_PROFESSIONAL_MONTHLY=price_...
PRICE_PROFESSIONAL_ANNUAL=price_...
PRICE_ENTERPRISE_MONTHLY=price_...
PRICE_ENTERPRISE_ANNUAL=price_...
```

#### LLM APIs
```
# OpenAI
OPENAI_API_KEY=sk-... (sensitive!)

# Anthropic
ANTHROPIC_API_KEY=sk-ant-... (sensitive!)

# Perplexity
PERPLEXITY_API_KEY=pplx-... (sensitive!)

# Google Gemini
GEMINI_API_KEY=AIza... (sensitive!)
```

#### n8n Cloud
```
N8N_WEBHOOK_BASE_URL=https://your-instance.app.n8n.cloud
N8N_WEBHOOK_SECRET=your-secret-key (sensitive!)
```

#### Application Config
```
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com (production) or https://staging-yourdomain.vercel.app (preview)
NEXT_PUBLIC_APP_NAME=GEO Platform
NODE_ENV=production (auto-set by Vercel)
```

#### Monitoring & Analytics (Phase 2)
```
SENTRY_DSN=https://...@sentry.io/... (error tracking)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-... (Google Analytics)
POSTHOG_API_KEY=phc_... (product analytics)
```

### Environment Variable Management
- **Vercel Dashboard:** Add via Settings → Environment Variables
- **Local Development:** Use `.env.local` file (gitignored)
- **Secrets Rotation:** Rotate all API keys quarterly
- **Access Control:** Limit team access to production secrets

---

## Domain & SSL Configuration

### Custom Domain Setup
1. **Primary Domain:** `app.yourdomain.com`
   - Add domain in Vercel dashboard
   - Configure DNS:
     - Type: CNAME
     - Name: app
     - Value: cname.vercel-dns.com
   - SSL: Auto-provisioned by Vercel (Let's Encrypt)

2. **Redirect Root Domain:**
   - `yourdomain.com` → Marketing site (separate)
   - `www.yourdomain.com` → Marketing site

3. **Staging Domain:**
   - Use default: `staging-yourdomain.vercel.app`
   - Or custom: `staging.yourdomain.com`

### SSL/TLS Settings
- **SSL Certificate:** Auto-renewal by Vercel
- **TLS Version:** 1.2 minimum (Vercel default)
- **HSTS:** Enable (Strict-Transport-Security header)

---

## CI/CD Pipeline

### GitHub Integration
- **Repository:** Connect to GitHub repo
- **Auto Deployments:** Enabled for all branches
- **Branch Protection:**
  - `main`: Require PR reviews (2 approvals), status checks pass
  - `develop`: Require status checks pass

### Deployment Workflow
```
1. Developer pushes to feature branch
   ↓
2. Vercel creates preview deployment
   ↓
3. Run automated checks:
   - TypeScript compilation
   - ESLint
   - Unit tests (jest)
   - Build succeeds
   ↓
4. Preview URL generated → Comment on PR
   ↓
5. Manual testing on preview
   ↓
6. PR approved → Merge to develop
   ↓
7. Staging deployment auto-triggered
   ↓
8. Integration tests run on staging
   ↓
9. Manual QA on staging
   ↓
10. PR from develop → main
    ↓
11. Production deployment (with rollback capability)
```

### Pre-Deployment Checks
Create `vercel-build.sh` script:
```bash
#!/bin/bash
set -e

echo "Running pre-deployment checks..."

# Type checking
echo "Type checking..."
npm run type-check

# Linting
echo "Linting..."
npm run lint

# Unit tests
echo "Running tests..."
npm run test

# Build
echo "Building..."
npm run build

echo "Pre-deployment checks passed!"
```

Update `package.json`:
```json
{
  "scripts": {
    "build": "sh vercel-build.sh && next build",
    "type-check": "tsc --noEmit",
    "lint": "next lint",
    "test": "jest"
  }
}
```

---

## Database Migrations

### Supabase Migration Strategy
- **Tool:** Supabase CLI
- **Migration Files:** Store in `/supabase/migrations/`
- **Version Control:** Commit all migrations to git

### Migration Process
1. **Development:**
   ```bash
   # Create new migration
   supabase migration new add_new_feature

   # Apply locally
   supabase db push
   ```

2. **Staging:**
   ```bash
   # Apply to staging database
   supabase db push --project-ref staging-project-ref
   ```

3. **Production:**
   ```bash
   # Apply to production (with backup)
   supabase db push --project-ref production-project-ref
   ```

### Migration Best Practices
- **Always test on staging first**
- **Include rollback script** for each migration
- **Run during low-traffic hours**
- **Take database snapshot** before major migrations
- **Document breaking changes**

---

## Monitoring & Observability

### Vercel Analytics
- **Enable:** Vercel Analytics for Web Vitals
- **Track:**
  - Page load times
  - First Contentful Paint (FCP)
  - Largest Contentful Paint (LCP)
  - Time to Interactive (TTI)
  - Cumulative Layout Shift (CLS)

### Error Tracking (Phase 2 - Sentry)
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
    }
    return event;
  }
});
```

### Logging Strategy
1. **Application Logs:**
   - Use `console.log`, `console.error` (automatically captured by Vercel)
   - Structure: `[timestamp] [level] [context] message`
   - Keep in Vercel dashboard for 1 hour (hobby plan) or 7 days (pro plan)

2. **API Request Logs:**
   - Log all API route calls with: method, path, status, duration
   - Log errors with stack traces

3. **Database Logs:**
   - Supabase logs slow queries (>1s)
   - Monitor in Supabase dashboard

4. **Workflow Logs:**
   - n8n logs all workflow executions
   - Keep for 7 days

### Health Checks
Create `/api/health` endpoint:
```typescript
export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    services: {
      database: await checkSupabase(),
      stripe: await checkStripe(),
      n8n: await checkN8N()
    }
  };

  const allHealthy = Object.values(checks.services).every(s => s === 'ok');

  return Response.json(checks, {
    status: allHealthy ? 200 : 503
  });
}
```

### Uptime Monitoring (Phase 2)
- **Tool:** UptimeRobot or Better Uptime
- **Monitor:**
  - Homepage: `https://app.yourdomain.com`
  - Health endpoint: `https://app.yourdomain.com/api/health`
  - Check interval: 5 minutes
- **Alerts:**
  - Email + Slack on downtime
  - Alert if response time > 5s

---

## Security Configuration

### Headers Configuration
Create `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ];
  }
};
```

### CORS Configuration
For API routes that need CORS (e.g., webhook endpoints):
```typescript
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://app.yourdomain.com',
    'https://staging-yourdomain.vercel.app'
  ];

  const headers = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // ... handle request
}
```

### Rate Limiting (Phase 2)
Implement at API route level:
```typescript
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export async function POST(request: Request) {
  try {
    await limiter.check(10, request.ip); // 10 requests per minute
  } catch {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // ... handle request
}
```

---

## Backup & Disaster Recovery

### Database Backups
- **Supabase Automatic Backups:**
  - Daily backups (retained 7 days on free, 30+ days on pro)
  - Point-in-time recovery available
- **Manual Backups:**
  - Before major migrations
  - Weekly export to external storage (Phase 2)

### Application Code
- **Git Repository:** Primary source of truth
- **GitHub:** Automatic backups
- **Local Mirrors:** Team members have clones

### Disaster Recovery Plan
1. **Database Corruption:**
   - Restore from latest Supabase backup
   - Apply migrations since backup
   - Verify data integrity

2. **Vercel Outage:**
   - Status: Monitor Vercel status page
   - Fallback: Deploy to backup hosting (Phase 2)
   - Communication: Update status page

3. **Data Loss:**
   - Restore from backup
   - Review transaction logs
   - Communicate with affected users

### RTO (Recovery Time Objective)
- **Target:** 4 hours for production recovery
- **Database Restore:** 1 hour
- **Application Redeploy:** 30 minutes
- **Verification:** 30 minutes

---

## Performance Optimization

### Next.js Optimization
1. **Image Optimization:**
   ```typescript
   import Image from 'next/image';

   <Image
     src="/logo.png"
     alt="Logo"
     width={200}
     height={100}
     priority={true} // for above-fold images
   />
   ```

2. **Code Splitting:**
   - Dynamic imports for heavy components
   ```typescript
   const ContentWriter = dynamic(() => import('@/components/ContentWriter'), {
     loading: () => <Skeleton />,
     ssr: false
   });
   ```

3. **Route Prefetching:**
   - Next.js Link component auto-prefetches
   - Use `prefetch={false}` for less critical links

4. **API Route Optimization:**
   - Use Edge Runtime where possible
   - Implement response caching
   - Minimize external API calls

### Database Optimization
- **Indexes:** Already specified in Supabase spec
- **Connection Pooling:** Supabase handles automatically
- **Query Optimization:** Use `select` to limit columns returned
- **Pagination:** Always paginate large result sets

### Bundle Size Monitoring
- **Tool:** @next/bundle-analyzer
- **Target:** Initial bundle < 200KB gzipped
- **Monitor:** Check on each deploy
- **Action:** Tree-shake unused dependencies

---

## Rollback Procedures

### Vercel Instant Rollback
1. **Via Dashboard:**
   - Go to Deployments
   - Find previous successful deployment
   - Click "Promote to Production"
   - Takes effect in ~30 seconds

2. **Via CLI:**
   ```bash
   vercel rollback <deployment-url>
   ```

### Database Rollback
1. **Migration Rollback:**
   - Run down migration script
   - Verify data integrity
   - Redeploy compatible application code

2. **Point-in-Time Recovery:**
   - Contact Supabase support (Pro plan)
   - Specify recovery timestamp
   - Restoration time: ~1-2 hours

### When to Rollback
- Critical bugs affecting >10% of users
- Payment processing failures
- Data corruption detected
- Security vulnerability exposed
- Performance degradation >50%

---

## Scaling Considerations

### Vercel Scaling
- **Automatic:** Serverless functions auto-scale
- **Limits:**
  - Hobby: 100GB bandwidth/month
  - Pro: 1TB bandwidth/month
  - Function timeout: 10s (hobby), 60s (pro), 300s (enterprise)
- **Monitoring:** Track bandwidth and function duration

### Database Scaling (Phase 2)
- **Supabase Pro Plan:** Increased connection limits
- **Read Replicas:** For heavy read workloads
- **Connection Pooling:** Already handled by Supabase

### n8n Scaling
- **Plan Upgrade:** Pro → Business as workflows increase
- **Execution Limits:**
  - Pro: 10,000 executions/month
  - Business: 50,000 executions/month
- **Optimization:** Batch operations, reduce polling frequency

### CDN & Caching
- **Vercel Edge Network:** Automatic global distribution
- **Static Assets:** Cached at edge
- **Dynamic Content:** Consider ISR for semi-static pages

---

## Cost Monitoring

### Monthly Budget Estimates
- **Vercel Pro:** $20/month (per seat)
- **Supabase Pro:** $25/month (if needed for scaling)
- **n8n Cloud Pro:** $20/month
- **Stripe:** 2.9% + $0.30 per transaction
- **LLM APIs:** Variable (passed to customers via credits)
- **Domain:** $12/year
- **SSL:** Free (Vercel)

**Total Fixed:** ~$65-90/month (MVP)

### Cost Alerts
- Set up billing alerts in each platform
- Alert at 80% of budget
- Review costs weekly during first month

---

## Maintenance Schedule

### Weekly
- Review error logs (Monday)
- Check API rate limits and usage
- Monitor slow database queries
- Review user feedback/bug reports

### Monthly
- Update dependencies (`npm outdated`)
- Security patches (`npm audit fix`)
- Review and optimize bundle size
- Rotate API keys (if needed)
- Review cost analysis

### Quarterly
- Rotate all API secrets
- Performance audit
- Security audit
- Backup testing (restore verification)
- Review and update documentation

---

## Deployment Checklist

### Pre-Launch Checklist
- [ ] All environment variables configured (prod, preview, dev)
- [ ] Custom domain configured with SSL
- [ ] Database migrations applied to production
- [ ] Supabase RLS policies tested and enabled
- [ ] n8n workflows published and tested
- [ ] Stripe products and prices created in live mode
- [ ] Stripe webhooks configured for production URL
- [ ] All API keys are production keys (not test)
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Vercel Analytics)
- [ ] Uptime monitoring configured
- [ ] Health check endpoint tested
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] CORS policies configured
- [ ] 404 and 500 error pages customized
- [ ] Favicon and meta tags set
- [ ] robots.txt configured
- [ ] sitemap.xml generated
- [ ] Performance tested (Lighthouse score > 90)
- [ ] Accessibility tested (a11y)
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Mobile responsive tested
- [ ] Load tested (handle 100 concurrent users)
- [ ] Backup and recovery procedures documented
- [ ] Rollback procedure tested
- [ ] Team access and permissions configured
- [ ] Status page created (statuspage.io or similar)
- [ ] Support email configured
- [ ] Privacy policy and terms of service live

### Post-Launch Checklist
- [ ] Monitor error rates first 24 hours
- [ ] Verify all webhooks firing correctly
- [ ] Test complete user signup flow
- [ ] Test subscription upgrade/downgrade
- [ ] Test payment failure scenarios
- [ ] Monitor API latency and timeouts
- [ ] Check database performance
- [ ] Verify email deliverability
- [ ] Collect user feedback
- [ ] Review analytics data

---

## Emergency Contacts

### Service Providers
- **Vercel Support:** support@vercel.com, Dashboard chat
- **Supabase Support:** support@supabase.com, Discord
- **Stripe Support:** support@stripe.com, Dashboard chat (live)
- **n8n Support:** support@n8n.io

### Internal Team
- **Technical Lead:** [Name] - [Phone] - [Email]
- **DevOps:** [Name] - [Phone] - [Email]
- **Product Owner:** [Name] - [Phone] - [Email]

### Escalation Path
1. Developer detects issue
2. Notify technical lead
3. If critical: All hands on deck
4. If customer-impacting: Notify product owner
5. Communicate status to customers

---

## Documentation Requirements

### Technical Documentation
- **README.md:** Project setup, local development
- **CONTRIBUTING.md:** Code style, PR process
- **ARCHITECTURE.md:** System overview, data flow
- **API.md:** API endpoint documentation
- **DEPLOYMENT.md:** Deployment procedures (this document)

### Operational Runbooks
- **Incident Response:** How to handle production incidents
- **Backup & Restore:** Step-by-step recovery procedures
- **Scaling Guide:** When and how to scale each component
- **Monitoring Guide:** What to monitor and alert thresholds

---

## Notes for Claude Code

**Deployment Philosophy:**
- Automate everything possible (CI/CD, backups, monitoring)
- Deploy frequently (multiple times per day once stable)
- Monitor aggressively (better to have too many alerts than miss critical issues)
- Always have rollback plan before deploying

**Environment Separation:**
- Keep preview and production completely isolated
- Never test on production
- Use same deployment process for all environments (consistency)

**Security First:**
- Never commit secrets to git (use .env.local, gitignored)
- Rotate keys regularly
- Limit access to production environment
- Audit all API endpoints for authorization

**Performance Monitoring:**
- Set performance budgets (bundle size, LCP, etc.)
- Fail builds that exceed budgets
- Monitor real user metrics, not just synthetic tests
- Optimize for slowest connection speeds (3G)

**This specification provides complete deployment and operational requirements. Claude Code should set up the CI/CD pipeline, configure all necessary services, implement monitoring, and ensure the application is production-ready with proper security, performance, and reliability.**
