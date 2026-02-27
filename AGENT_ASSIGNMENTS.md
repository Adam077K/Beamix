# GEO Platform - Agent Assignments
## Sub-Agent Roles, Responsibilities & Coordination

**Version:** 1.0  
**Created:** February 14, 2026  
**Purpose:** Define which agent does what, when, and how they coordinate

---

## Agent Roster

### Team A: Infrastructure & Backend

#### `database-architect`
**Role:** Database design, schema, migrations, optimization  
**Primary Skills:** `database-design`, `performance-profiling`  
**Reports To:** Technical Lead  
**Works With:** `backend-specialist`, `security-auditor`

**Responsibilities:**
- Design and implement all database tables
- Create database functions and triggers
- Optimize queries and indexes
- Write and test migrations
- Document schema and relationships

**Key Deliverables:**
- 3 migration files (schema, functions, RLS)
- Database documentation
- Query optimization report

**Task Assignments:**
- TASK-001: Complete Database Schema
- TASK-002: Database Functions and Triggers
- Plus: Index optimization, query analysis

---

#### `backend-specialist`
**Role:** API development, business logic, integrations  
**Primary Skills:** `api-patterns`, `nodejs-best-practices`, `intelligent-routing`  
**Reports To:** Technical Lead  
**Works With:** All teams (provides APIs)

**Responsibilities:**
- Build all API routes (25+ endpoints)
- Implement business logic (credit system, recommendations)
- Integrate with external services (n8n, Stripe, LLMs)
- Error handling and validation
- API documentation

**Key Deliverables:**
- 25+ API routes
- Integration with n8n (webhook triggers)
- Stripe webhook handler
- API documentation (Swagger/OpenAPI)

**Task Assignments:**
- TASK-009: API Route Structure
- TASK-010: Dashboard Overview API
- TASK-011: Query Management APIs
- TASK-012: Credits API
- TASK-013: Initial Analysis n8n Workflow
- Plus: 20+ more API tasks

---

#### `security-auditor`
**Role:** Security, authentication, authorization, compliance  
**Primary Skills:** `red-team-tactics`, `vulnerability-scanner`  
**Reports To:** Technical Lead  
**Works With:** `database-architect`, `backend-specialist`

**Responsibilities:**
- Implement Row-Level Security policies
- Audit API endpoints for vulnerabilities
- Review authentication flows
- Configure CORS, CSP headers
- Secret management
- Security testing

**Key Deliverables:**
- RLS policies for all tables
- Security audit report
- Penetration test results
- Compliance checklist (GDPR, PCI)

**Task Assignments:**
- TASK-003: Row-Level Security Policies
- TASK-048: Stripe Webhook Signature Verification
- TASK-089: Security Audit
- TASK-090: Rate Limiting Implementation

---

### Team B: Frontend & Dashboard

#### `frontend-specialist`
**Role:** UI development, state management, user experience  
**Primary Skills:** `nextjs-react-expert`, `frontend-design`, `tailwind-patterns`, `vercel-react-best-practices`  
**Reports To:** Product Manager  
**Works With:** `backend-specialist` (consumes APIs), `product-manager` (requirements)

**Responsibilities:**
- Build all dashboard pages and components
- Implement state management (React Query + Zustand)
- Create reusable UI components
- Ensure responsive design (mobile-first)
- Accessibility (WCAG AA)
- Performance optimization

**Key Deliverables:**
- 12+ dashboard pages
- 50+ React components
- State management setup
- Mobile-responsive layouts
- Storybook component library

**Task Assignments:**
- TASK-007: React Query + Zustand Setup
- TASK-008: Shadcn UI Installation
- TASK-014: Dashboard Metrics UI
- TASK-015: Query Management UI
- Plus: 40+ more frontend tasks

---

#### `product-manager`
**Role:** Requirements clarification, feature acceptance, user stories  
**Primary Skills:** `plan-writing`, `brainstorming`  
**Reports To:** Project Lead  
**Works With:** `frontend-specialist`, all agents (clarifies requirements)

**Responsibilities:**
- Clarify ambiguous requirements from PRD
- Review frontend implementations against specs
- Write acceptance criteria for features
- Prioritize feature requests
- User testing coordination

**Key Deliverables:**
- Feature acceptance sign-offs
- User stories and acceptance criteria
- Usability testing reports
- Product backlog updates

**Task Assignments:**
- TASK-014: Dashboard UI Review (acceptance)
- TASK-034: Pricing Page Review
- TASK-058: Agent UX Review
- TASK-095: MVP Feature Acceptance

---

### Team C: Payments & Credits

#### `backend-specialist` (same agent, different focus)
**Role:** Stripe integration, webhook handling, subscription management  
**Primary Skills:** `api-patterns`, `nodejs-best-practices`  
**Reports To:** Technical Lead  
**Works With:** `security-auditor`, `frontend-specialist`

**Responsibilities:**
- Configure Stripe products and prices
- Build checkout flow API
- Implement webhook handlers for all subscription events
- Credit allocation and deduction logic
- Customer portal integration
- Subscription state management

**Key Deliverables:**
- Stripe checkout flow (API + UI)
- 6 webhook handlers
- Credit system (allocation, deduction, transactions)
- Customer portal integration

**Task Assignments:**
- TASK-006: Stripe Product Configuration
- TASK-043: Checkout Session API
- TASK-044: Stripe Webhook Handler
- TASK-045: Customer Portal API
- TASK-046: Credit Allocation Logic
- Plus: 8 more billing tasks

---

### Team D: AI Agents & Automation

#### Backend specialist (n8n workflow builder)
**Role:** n8n workflow development, LLM integration, automation  
**Primary Skills:** `intelligent-routing`, `nodejs-best-practices`, `geo-fundamentals`  
**Reports To:** Technical Lead  
**Works With:** `backend-specialist` (API), all agents (prompt engineering)

**Responsibilities:**
- Build 7 n8n workflows
- Integrate with 4 LLM APIs (OpenAI, Anthropic, Perplexity, Gemini)
- Implement agent business logic
- Error handling and retry logic
- Scheduled jobs (cron)
- Prompt engineering and optimization

**Key Deliverables:**
- 7 complete n8n workflows:
  1. Initial Analysis
  2. Content Writer Agent
  3. Competitor Research Agent
  4. Query Researcher Agent
  5. Scheduled Ranking Update
  6. Recommendation Generator
  7. Global Error Handler
- LLM prompt library
- Workflow documentation

**Task Assignments:**
- TASK-005: n8n Cloud Workspace Setup
- TASK-013: Initial Analysis Workflow
- TASK-061: Content Writer Agent Workflow
- TASK-062: Content Writer API Endpoint
- TASK-067: Competitor Research Workflow
- TASK-072: Query Researcher Workflow
- TASK-077: Scheduled Ranking Update Workflow
- TASK-082: Recommendation Generator Workflow

---

### Team E: Testing & Verification

#### `test-engineer`
**Role:** Test planning, E2E tests, integration tests  
**Primary Skills:** `tdd-workflow`, `webapp-testing`  
**Reports To:** Quality Lead  
**Works With:** All teams (tests their work)

**Responsibilities:**
- Write test plans for all features
- Implement E2E tests (Playwright)
- Integration tests for API routes
- Unit tests for critical functions
- Test data management
- Bug reporting and tracking

**Key Deliverables:**
- E2E test suite (50+ scenarios)
- Integration test suite
- Test coverage report (>80%)
- Bug tracking and resolution

**Task Assignments:**
- TASK-096: E2E Test Suite Setup
- TASK-097: Auth Flow Tests
- TASK-098: Dashboard Tests
- TASK-099: Agent Execution Tests
- TASK-100: Billing Tests
- Plus: 15 more testing tasks

---

#### `qa-automation-engineer`
**Role:** Automated testing, CI/CD integration, performance testing  
**Primary Skills:** `testing-patterns`, `webapp-testing`, `performance-profiling`  
**Reports To:** Quality Lead  
**Works With:** `test-engineer`, `devops-engineer`

**Responsibilities:**
- Set up CI/CD pipelines for testing
- Performance benchmarking
- Load testing
- Automated regression tests
- Visual regression testing
- Mobile device testing

**Key Deliverables:**
- CI/CD test pipeline
- Performance test results
- Load test reports
- Cross-browser test matrix

**Task Assignments:**
- TASK-101: CI/CD Test Pipeline
- TASK-102: Performance Benchmarks
- TASK-103: Load Testing
- TASK-104: Visual Regression Tests

---

#### `devops-engineer`
**Role:** Deployment, infrastructure, monitoring  
**Primary Skills:** `deployment-procedures`, `server-management`  
**Reports To:** Infrastructure Lead  
**Works With:** All teams (deploys their work)

**Responsibilities:**
- Environment setup and configuration
- Deployment automation
- Monitoring and logging
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- Backup and disaster recovery

**Key Deliverables:**
- Production deployment
- Staging environment
- Monitoring dashboards
- Deployment documentation
- Rollback procedures

**Task Assignments:**
- TASK-004: Environment Variables Setup
- TASK-105: Vercel Deployment Configuration
- TASK-106: Monitoring Setup (Sentry, Vercel Analytics)
- TASK-107: Logging Infrastructure
- TASK-108: Backup Configuration

---

## Coordination Matrix

### Who Works With Whom

| Agent | Works Closely With | Communication Channel |
|-------|-------------------|----------------------|
| `database-architect` | `backend-specialist`, `security-auditor` | Schema changes, RLS reviews |
| `backend-specialist` | All teams | API contracts, endpoint availability |
| `security-auditor` | `database-architect`, `backend-specialist` | Security reviews, RLS policies |
| `frontend-specialist` | `backend-specialist`, `product-manager` | API integration, UI reviews |
| `product-manager` | `frontend-specialist`, Test team | Feature acceptance, bug triage |
| n8n builder | `backend-specialist`, All (prompts) | Workflow integration, prompt testing |
| `test-engineer` | All teams | Test plans, bug reports |
| `qa-automation-engineer` | `test-engineer`, `devops-engineer` | CI/CD integration |
| `devops-engineer` | All teams | Deployment coordination |

---

### Communication Protocols

#### Schema Changes
**When:** `database-architect` modifies database schema  
**Protocol:**
1. `database-architect` updates migration file
2. Posts in shared doc: "Schema change: added column X to table Y"
3. `backend-specialist` updates API types
4. `frontend-specialist` updates UI queries if needed
5. All teams acknowledge change

#### API Contract Changes
**When:** `backend-specialist` changes API endpoint structure  
**Protocol:**
1. `backend-specialist` updates API documentation
2. Posts in shared doc: "API change: /api/X now returns field Y"
3. `frontend-specialist` updates components consuming API
4. `test-engineer` updates integration tests
5. All teams acknowledge change

#### n8n Workflow Updates
**When:** n8n builder modifies workflow logic  
**Protocol:**
1. Test workflow in n8n staging workspace
2. Post in shared doc: "Workflow X updated: now handles error case Y"
3. `backend-specialist` verifies webhook integration
4. `test-engineer` adds test for new behavior

#### Deployment
**When:** New code ready to deploy  
**Protocol:**
1. Feature branch merged to `develop`
2. `devops-engineer` deploys to staging
3. `test-engineer` runs smoke tests on staging
4. If tests pass, deploy to production
5. Monitor for 30 minutes post-deploy

---

## Task Assignment by Agent

### Phase 0: Foundation (Days 1-2)

| Agent | Tasks | Hours | Blockers |
|-------|-------|-------|----------|
| `database-architect` | TASK-001, TASK-002 | 5h | None |
| `security-auditor` | TASK-003 | 2h | TASK-001 |
| `devops-engineer` | TASK-004, TASK-005 | 3h | None |
| `backend-specialist` | TASK-006 | 1h | None |
| `frontend-specialist` | TASK-007, TASK-008 | 3h | None |
| **Total** | **8 tasks** | **14h** | **Parallel** |

### Phase 1: Core Backend (Days 3-5)

| Agent | Tasks | Hours | Dependencies |
|-------|-------|-------|--------------|
| `backend-specialist` | TASK-009 to TASK-013 | 11h | Phase 0 complete |
| `frontend-specialist` | TASK-014, TASK-015 | 6h | TASK-010, TASK-011 |
| n8n builder | TASK-013 | 4h | TASK-005 |
| **Total** | **7 tasks** | **21h** | **Mixed parallel/serial** |

*(Continue for all phases...)*

---

## Skill Requirements by Agent

### `database-architect`
**Must Use:**
- `database-design` - All schema and migration tasks
- `performance-profiling` - Query optimization

**Optional:**
- `nodejs-best-practices` - Database function logic

### `backend-specialist`
**Must Use:**
- `api-patterns` - All API route tasks
- `nodejs-best-practices` - Code quality, error handling
- `intelligent-routing` - Webhook coordination

**Optional:**
- `geo-fundamentals` - Understanding LLM ranking logic
- `clean-code` - Code review and refactoring

### `frontend-specialist`
**Must Use:**
- `nextjs-react-expert` - Performance optimization
- `vercel-react-best-practices` - React patterns
- `frontend-design` - UI/UX quality
- `tailwind-patterns` - Styling consistency

**Optional:**
- `webapp-testing` - Component testing
- `brainstorming` - Creative UI solutions

### `security-auditor`
**Must Use:**
- `red-team-tactics` - Security testing
- `vulnerability-scanner` - Automated scans

**Optional:**
- `database-design` - RLS policy optimization

### n8n workflow builder
**Must Use:**
- `intelligent-routing` - Workflow orchestration
- `nodejs-best-practices` - n8n function nodes

**Optional:**
- `geo-fundamentals` - LLM optimization strategies
- `parallel-agents` - Multiple LLM queries

---

## Decision-Making Authority

### Who Decides What

| Decision Type | Decision Maker | Consults With | Example |
|---------------|---------------|---------------|---------|
| **Database schema changes** | `database-architect` | `backend-specialist` | "Add index on llm_rankings.timestamp" |
| **API endpoint design** | `backend-specialist` | `frontend-specialist` | "Add pagination to /api/queries" |
| **UI/UX patterns** | `frontend-specialist` | `product-manager` | "Use modal vs inline edit for queries" |
| **Security policies** | `security-auditor` | Technical Lead | "Require MFA for all accounts" |
| **Deployment timing** | `devops-engineer` | All teams | "Deploy to production Friday 5pm" |
| **Feature priority** | `product-manager` | Project Lead | "Defer Review Analysis to Phase 2" |
| **LLM prompt changes** | n8n builder | `product-manager` | "Improve Content Writer prompt for SEO" |
| **Test coverage requirements** | `test-engineer` | Quality Lead | "Require >80% coverage for billing logic" |

---

## Conflict Resolution

### When Agents Disagree

**Scenario:** `frontend-specialist` wants to change API response format, but `backend-specialist` says it's breaking change.

**Resolution Process:**
1. **Document the conflict** - Both agents explain position in shared doc
2. **Identify impact** - List affected components, downstream dependencies
3. **Propose alternatives** - Each agent suggests compromise
4. **Technical Lead decides** - Within 24 hours
5. **Implement decision** - Losing side helps implement winner's approach

**Escalation Path:**
Agent → Technical Lead → Project Lead → Product Owner

---

## Parallel Work Guidelines

### Safe to Parallelize

| Team A Work | Team B Work | Why Safe |
|-------------|-------------|----------|
| Database migrations | n8n workflow setup | Different systems |
| API route shells | Frontend component creation | Different layers |
| Stripe configuration | React Query setup | No overlap |
| Writing tests | Building features | Different files |

### Requires Coordination

| Team A Work | Team B Work | Coordination Needed |
|-------------|-------------|---------------------|
| API endpoint implementation | Frontend API consumer | API contract must be defined first |
| Database schema change | Backend queries | Schema must be updated before queries |
| n8n workflow logic | API webhook trigger | Webhook URL must be stable |
| Stripe webhook handler | Credit UI display | Credit logic must be consistent |

---

## Agent Handoffs

### When One Agent Completes, Another Starts

**Handoff 1: Database → Backend**
- **From:** `database-architect` completes TASK-001 (schema)
- **To:** `backend-specialist` starts TASK-009 (API routes)
- **Artifact:** Migration files, schema documentation
- **Verification:** `backend-specialist` runs migrations locally, confirms tables exist

**Handoff 2: Backend API → Frontend**
- **From:** `backend-specialist` completes TASK-010 (Dashboard API)
- **To:** `frontend-specialist` starts TASK-014 (Dashboard UI)
- **Artifact:** API endpoint, response schema, example response
- **Verification:** `frontend-specialist` tests endpoint with Postman, confirms response format

**Handoff 3: n8n Workflow → Backend Trigger**
- **From:** n8n builder completes TASK-013 (Initial Analysis workflow)
- **To:** `backend-specialist` implements webhook trigger in onboarding
- **Artifact:** Webhook URL, request schema, response schema
- **Verification:** `backend-specialist` triggers webhook manually, confirms workflow executes

**Handoff 4: Feature Complete → Testing**
- **From:** Feature team completes feature (e.g., Query Management)
- **To:** `test-engineer` starts testing
- **Artifact:** Feature documentation, acceptance criteria, test data
- **Verification:** `test-engineer` confirms feature matches acceptance criteria

---

## Daily Standup Format

Each agent posts in shared doc:

### [Agent Name] - [Date]

**✅ Completed Yesterday:**
- TASK-XXX: [Task name] (link to PR if applicable)
- TASK-YYY: [Task name]

**🚧 Working On Today:**
- TASK-ZZZ: [Task name] (expected completion: [time])

**🚨 Blockers:**
- Waiting for [Agent] to complete [Task]
- Issue with [Tool/API]: [Brief description]

**🤝 Need From Others:**
- @backend-specialist: Confirm API endpoint for [feature]
- @frontend-specialist: Review UI mockup

**Example:**
```markdown
### frontend-specialist - Feb 15, 2026

✅ Completed Yesterday:
- TASK-007: React Query + Zustand Setup
- TASK-008: Shadcn UI Installation

🚧 Working On Today:
- TASK-014: Dashboard Metrics UI (expected completion: 5pm)

🚨 Blockers:
- None

🤝 Need From Others:
- @backend-specialist: Deploy TASK-010 to staging so I can test API integration
```

---

## Agent Availability

### Expected Online Hours

| Agent | Primary Hours (UTC) | Overlap With Team |
|-------|-------------------|-------------------|
| `database-architect` | 09:00-17:00 | Full team overlap |
| `backend-specialist` | 09:00-18:00 | Full team overlap |
| `frontend-specialist` | 10:00-18:00 | Full team overlap |
| `security-auditor` | 09:00-17:00 | Full team overlap |
| n8n builder | 11:00-19:00 | 75% overlap |
| `test-engineer` | 08:00-16:00 | 75% overlap |
| `devops-engineer` | Flexible | On-call |
| `product-manager` | 10:00-18:00 | Full team overlap |

**Core Hours (all agents expected online):** 11:00-17:00 UTC

---

## Success Metrics by Agent

### How We Measure Agent Performance

| Agent | Metric | Target |
|-------|--------|--------|
| `database-architect` | Migrations pass first try | 100% |
| `database-architect` | Query performance (p95) | <200ms |
| `backend-specialist` | API uptime | 99.9% |
| `backend-specialist` | API response time (p95) | <200ms |
| `frontend-specialist` | Lighthouse score | >90 |
| `frontend-specialist` | Zero CLS, LCP <2.5s | ✅ |
| `security-auditor` | Critical vulnerabilities | 0 |
| `security-auditor` | RLS policy coverage | 100% |
| n8n builder | Workflow success rate | >95% |
| n8n builder | Avg execution time | <5min |
| `test-engineer` | Test coverage (critical paths) | >80% |
| `test-engineer` | Bug escape rate | <5% |
| `devops-engineer` | Deployment success rate | 100% |
| `devops-engineer` | Mean time to recovery (MTTR) | <30min |

---

## Next Steps for Agents

### Immediate Actions (Today)

**All Agents:**
1. Read this document thoroughly
2. Review your assigned tasks in IMPLEMENTATION_TASKS.md
3. Set up local development environment
4. Join shared communication channel

**Phase 0 Agents (Start Immediately):**
- `database-architect`: Begin TASK-001 (schema)
- `devops-engineer`: Begin TASK-004 (env vars), TASK-005 (n8n setup)
- `backend-specialist`: Begin TASK-006 (Stripe config)
- `frontend-specialist`: Begin TASK-007 (React Query), TASK-008 (Shadcn)
- `security-auditor`: Review PRD security requirements, prepare for TASK-003

---

**Created:** February 14, 2026  
**Last Updated:** February 14, 2026  
**Status:** Ready for agent assignments  
**Next Review:** End of Phase 0 (Day 2)
