# 02 — Skills Library Audit (2026-05-16)

**Purpose:** Identify which of the 426 active skills (430 directory entries minus 4 non-skill files) are referenced by agent files, commands, or docs. Categorize the rest for aggressive deletion ahead of the war-room rethink.

**Methodology:** Built a 29k-line corpus from `.agent/agents/*.md`, `.claude/agents/*.md`, `.claude/commands/*.md`, `CLAUDE.md`, `docs/00-brain/*.md`, `WAR-ROOM-MASTER.md`, `ORCHESTRATION.md`. Two-pass grep: strict (path/quoted form) and loose (substring). Clustered orphans by name+description.

## Summary

| Bucket | Count | Action |
|---|---|---|
| **Total skill directories** | 430 | — |
| Non-skill files (README, BUNDLES, SPDD, GETTING_STARTED) | 4 | Leave or move out of `skills/` |
| **True skills** | 426 | — |
| REFERENCED (named in agent/command/doc) | 110 | **KEEP** |
| CATEGORY-MATCH (named only in CLAUDE.md illustrative lists) | 10 | **REVIEW — keep ~5** |
| ORPHAN (never mentioned anywhere) | 306 | **CUT** |

**Estimated token savings from cutting orphans:** ~68,400 lines across 305 orphan SKILL.md files. At ~10 tokens/line average → **~680K tokens** of dormant context. Even though skills load on-demand, they bloat MANIFEST.json (167KB / ~50k tokens) which IS read by every CEO/lead pre-flight. Manifest pruning alone saves ~36KB / ~10k tokens per session.

## REFERENCED Skills (MUST keep)

These 110 skills are named explicitly in at least one agent prompt, command, or doc.

| Skill | Description |
|---|---|
| `ai-engineer` | \| |
| `api-design-principles` | Master REST and GraphQL API design principles to build intuitive, scalable, and maintainable APIs th |
| `api-documentation` | API documentation workflow for generating OpenAPI specs, creating developer guides, and maintaining  |
| `api-documentation-generator` | Generate comprehensive, developer-friendly API documentation from code, including endpoints, paramet |
| `api-security-testing` | API security testing workflow for REST and GraphQL APIs covering authentication, authorization, rate |
| `architecture` | Architectural decision-making framework. Requirements analysis, trade-off evaluation, ADR documentat |
| `architecture-decision-records` | Write and maintain Architecture Decision Records (ADRs) following best practices for technical decis |
| `architecture-patterns` | Implement proven backend architecture patterns including Clean Architecture, Hexagonal Architecture, |
| `auth-implementation-patterns` | Master authentication and authorization patterns including JWT, OAuth2, session management, and RBAC |
| `brainstorming` | Use before creative or constructive work (features, architecture, behavior). Transforms vague ideas  |
| `broken-authentication` | This skill should be used when the user asks to \"test for broken authentication vulnerabilities\",  |
| `cc-skill-coding-standards` | Universal coding standards, best practices, and patterns for TypeScript, JavaScript, React, and Node |
| `cc-skill-security-review` | Use this skill when adding authentication, handling user input, working with secrets, creating API e |
| `clerk-auth` | Expert patterns for Clerk auth implementation, middleware, organizations, webhooks, and user sync Us |
| `cloud-devops` | Cloud infrastructure and DevOps workflow covering AWS, Azure, GCP, Kubernetes, Terraform, CI/CD, mon |
| `code-documentation-code-explain` | You are a code education expert specializing in explaining complex code through clear narratives, vi |
| `code-refactoring-tech-debt` | You are a technical debt expert specializing in identifying, quantifying, and prioritizing technical |
| `code-review-excellence` | Master effective code review practices to provide constructive feedback, catch bugs early, and foste |
| `code-reviewer` | Elite code review expert specializing in modern AI-powered code |
| `commit` | Create commit messages following Sentry conventions. Use when committing code changes, writing commi |
| `competitive-landscape` | \| |
| `context-compression` | Design and evaluate compression strategies for long-running sessions |
| `copywriting` | > |
| `core-components` | Core component library and design system patterns. Use when building UI, using design tokens, or wor |
| `create-pr` | Create pull requests following Sentry conventions. Use when opening PRs, writing PR descriptions, or |
| `data-engineer` | \| |
| `data-storytelling` | Transform data into compelling narratives using visualization, context, and persuasive structure. Us |
| `database` | Database development and operations workflow covering SQL, NoSQL, database design, migrations, optim |
| `database-design` | Database design principles and decision-making. Schema design, indexing strategy, ORM selection, ser |
| `debugger` | \| |
| `debugging-strategies` | Master systematic debugging techniques, profiling tools, and root cause analysis to efficiently trac |
| `deep-research` | Execute autonomous multi-step research using Google Gemini Deep Research Agent. Use for: market anal |
| `deployment-procedures` | Production deployment principles and decision-making. Safe deployment workflows, rollback strategies |
| `design-orchestration` |  |
| `dispatching-parallel-agents` | Use when facing 2+ independent tasks that can be worked on without shared state or sequential depend |
| `documentation` | Documentation generation workflow covering API docs, architecture docs, README files, code comments, |
| `documentation-templates` | Documentation templates and structure guidelines. README, API docs, code comments, and AI-friendly d |
| `domain-driven-design` | Plan and route Domain-Driven Design work from strategic modeling to tactical implementation and even |
| `e2e-testing-patterns` | Master end-to-end testing with Playwright and Cypress to build reliable test suites that catch bugs, |
| `email-systems` | Email has the highest ROI of any marketing channel. $36 for every $1 spent. Yet most startups treat  |
| `embedding-strategies` | Select and optimize embedding models for semantic search and RAG applications. Use when choosing emb |
| `error-handling-patterns` | Master error handling patterns across languages including exceptions, Result types, error propagatio |
| `find-bugs` | Find bugs, security vulnerabilities, and code quality issues in local branch changes. Use when asked |
| `finishing-a-development-branch` | Use when implementation is complete, all tests pass, and you need to decide how to integrate the wor |
| `form-cro` | > |
| `frontend-design` | Create distinctive, production-grade frontend interfaces with intentional aesthetics, high craft, an |
| `frontend-dev-guidelines` | Opinionated frontend development standards for modern React + TypeScript applications. Covers Suspen |
| `frontend-developer` | \| |
| `gdpr-data-handling` | Implement GDPR-compliant data handling with consent management, data subject rights, and privacy by  |
| `git-pr-workflows-git-workflow` | Orchestrate a comprehensive git workflow from code review through PR creation, leveraging specialize |
| `github-actions-templates` | Create production-ready GitHub Actions workflows for automated testing, building, and deploying appl |
| `inngest` | Inngest expert for serverless-first background jobs, event-driven workflows, and durable execution w |
| `launch-strategy` | When the user wants to plan a product launch, feature announcement, or release strategy. Also use wh |
| `llm-app-patterns` | Production-ready patterns for building LLM applications. Covers RAG pipelines, agent architectures,  |
| `llm-evaluation` | Implement comprehensive evaluation strategies for LLM applications using automated metrics, human fe |
| `market-sizing-analysis` | \| |
| `marketing-psychology` | Apply behavioral science and mental models to marketing decisions, prioritized using a psychological |
| `multi-agent-patterns` | Master orchestrator, peer-to-peer, and hierarchical multi-agent architectures |
| `nextjs-app-router-patterns` | Master Next.js 14+ App Router with Server Components, streaming, parallel routes, and advanced data  |
| `nextjs-best-practices` | Next.js App Router principles. Server Components, data fetching, routing patterns. |
| `nextjs-supabase-auth` | Expert integration of Supabase Auth with Next.js App Router Use when: supabase auth next, authentica |
| `nodejs-backend-patterns` | Build production-ready Node.js backend services with Express/Fastify, implementing middleware patter |
| `onboarding-cro` | When the user wants to optimize post-signup onboarding, user activation, first-run experience, or ti |
| `page-cro` | > |
| `parallel-agents` | Multi-agent orchestration patterns. Use when multiple independent tasks can run with different domai |
| `payment-integration` | \| |
| `playwright-skill` | Complete browser automation with Playwright. Auto-detects dev servers, writes clean test scripts to  |
| `postgresql` | Design a PostgreSQL-specific schema. Covers best-practices, data types, indexing, constraints, perfo |
| `pricing-strategy` | Design pricing, packaging, and monetization strategies based on value, customer willingness to pay,  |
| `prisma-expert` | Prisma ORM expert for schema design, migrations, query optimization, relations modeling, and databas |
| `product-manager-toolkit` | Comprehensive toolkit for product managers including RICE prioritization, customer interview analysi |
| `production-code-audit` | Autonomously deep-scan entire codebase line-by-line, understand architecture and patterns, then syst |
| `prompt-caching` | Caching strategies for LLM prompts including Anthropic prompt caching, response caching, and CAG (Ca |
| `prompt-engineering-patterns` | Master advanced prompt engineering techniques to maximize LLM performance, reliability, and controll |
| `radix-ui-design-system` | Build accessible design systems with Radix UI primitives. Headless component customization, theming  |
| `rag-engineer` | Expert in building Retrieval-Augmented Generation systems. Masters embedding models, vector database |
| `react-patterns` | Modern React patterns and principles. Hooks, composition, performance, TypeScript best practices. |
| `react-ui-patterns` | Modern React UI patterns for loading states, error handling, and data fetching. Use when building UI |
| `readme` | When the user wants to create or update a README.md file for a project. Also use when the user says  |
| `requesting-code-review` | Use when completing tasks, implementing major features, or before merging to verify work meets requi |
| `screenshots` | Generate marketing screenshots of your app using Playwright. Use when the user wants to create scree |
| `search-specialist` | Expert web researcher using advanced search techniques and |
| `secrets-management` | Implement secure secrets management for CI/CD pipelines using Vault, AWS Secrets Manager, or native  |
| `security` | (missing SKILL.md) |
| `security-audit` | Comprehensive security auditing workflow covering web application testing, API security, penetration |
| `security-scanning-security-dependencies` | You are a security expert specializing in dependency vulnerability analysis, SBOM generation, and su |
| `segment-cdp` | Expert patterns for Segment Customer Data Platform including Analytics.js, server-side tracking, tra |
| `seo-content-writer` | \| |
| `sharp-edges` | Identify error-prone APIs and dangerous configurations |
| `social-content` | When the user wants help creating, scheduling, or optimizing social media content for LinkedIn, Twit |
| `sql-optimization-patterns` | Master SQL query optimization, indexing strategies, and EXPLAIN analysis to dramatically improve dat |
| `startup-financial-modeling` | \| |
| `startup-metrics-framework` | \| |
| `stripe-integration` | Implement Stripe payment processing for robust, PCI-compliant payment flows including checkout, subs |
| `systematic-debugging` | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes |
| `tailwind-design-system` | Build scalable design systems with Tailwind CSS, design tokens, component libraries, and responsive  |
| `tailwind-patterns` | Tailwind CSS v4 principles. CSS-first configuration, container queries, modern patterns, design toke |
| `tdd-orchestrator` | \| |
| `tdd-workflow` | Test-Driven Development workflow principles. RED-GREEN-REFACTOR cycle. |
| `testing-patterns` | Jest testing patterns, factory functions, mocking strategies, and TDD workflow. Use when writing uni |
| `ui-visual-validator` | \| |
| `unit-testing-test-generate` | Generate comprehensive, maintainable unit tests across languages with strong coverage and edge case  |
| `using-git-worktrees` | Use when starting feature work that needs isolation from current workspace or before executing imple |
| `vector-database-engineer` | Expert in vector databases, embedding strategies, and semantic search implementation. Masters Pineco |
| `vercel-deployment` | Expert knowledge for deploying to Vercel with Next.js Use when: vercel, deploy, deployment, hosting, |
| `wcag-audit-patterns` | Conduct WCAG 2.2 accessibility audits with automated testing, manual verification, and remediation g |
| `web-design-guidelines` | Review UI code for Web Interface Guidelines compliance. Use when asked to \\\"review my UI\\\", \\\" |
| `web-security-testing` | Web application security testing workflow for OWASP Top 10 vulnerabilities including injection, XSS, |
| `writing-plans` | Use when you have a spec or requirements for a multi-step task, before touching code |
| `xss-html-injection` | This skill should be used when the user asks to \"test for XSS vulnerabilities\", \"perform cross-si |

## CATEGORY-MATCH Skills (review)

These 10 are mentioned only in CLAUDE.md's illustrative category lists ("AI/ML: ai-engineer, rag-engineer, langgraph, voice-agents, *and more*") — not in any actual agent prompt. Treat as advertising copy, not real usage.

| Skill | Description | Verdict |
|---|---|---|
| `data-scientist` | \| | CUT — data-lead does this work |
| `docs` | (missing SKILL.md) | CUT — too generic, no usage |
| `e2e-testing` | End-to-end testing workflow with Playwright for browser automation, visual regre | KEEP — referenced by qa-lead |
| `evaluation` | Build evaluation frameworks for agent systems | CUT — covered by llm-evaluation + agent-evaluation |
| `langgraph` | Expert in LangGraph - the production-grade framework for building stateful, mult | CUT — Beamix uses Inngest/direct LLM, not LangGraph |
| `prompt-engineer` | Transforms user prompts into optimized prompts using frameworks (RTF, RISEN, Cha | CUT — duplicate of prompt-engineering-patterns |
| `prompt-engineering` | Expert guide on prompt engineering patterns, best practices, and optimization te | CUT — superseded by prompt-engineering-patterns |
| `trigger-dev` | Trigger.dev expert for background jobs, AI workflows, and reliable async executi | CUT — using Inngest, not trigger.dev |
| `ui-ux-pro-max` | UI/UX design intelligence. 50 styles, 21 palettes, 50 font pairings, 20 charts,  | CUT — explicitly superseded by design-taste-frontend in design-critic.md |
| `voice-agents` | Voice agents represent the frontier of AI interaction - humans speaking naturall | CUT — out of scope for Beamix product |

## ORPHAN Cluster Analysis

309 skills with no reference anywhere. Grouped by domain for triage.

### AI/ML & Agents — 47 orphans

**SELECTIVE KEEP.** Keep 5–8 directly applicable to Beamix's agent platform (agent-memory-systems, agent-tool-builder, agent-evaluation, ai-agents-architect, multi-agent-brainstorming, tool-design, mcp-builder). CUT the rest (langchain-architecture, crewai, langgraph variants, voice-agents, n8n-*, hugging-face-*, chrome-extension-developer, browser-extension-builder, computer-use-agents, copilot-sdk, ai-wrapper-product, etc.) — wrong stack or out of scope.

<details><summary>Skill list</summary>

| Skill | Description |
|---|---|
| `agent-evaluation` | Testing and benchmarking LLM agents including behavioral testing, capability ass |
| `agent-memory-mcp` | A hybrid memory system that provides persistent, searchable knowledge management |
| `agent-memory-systems` | Memory is the cornerstone of intelligent agents. Without it, every interaction s |
| `agent-orchestration-improve-agent` | Systematic improvement of existing agents through performance analysis, prompt e |
| `agent-orchestration-multi-agent-optimize` | Optimize multi-agent systems with coordinated profiling, workload distribution,  |
| `agent-tool-builder` | Tools are how AI agents interact with the world. A well-designed tool is the dif |
| `ai-agent-development` | AI agent development workflow for building autonomous agents, multi-agent system |
| `ai-agents-architect` | Expert in designing and building autonomous AI agents. Masters tool use, memory  |
| `ai-ml` | AI and machine learning workflow covering LLM application development, RAG imple |
| `ai-product` | Every product will be AI-powered. The question is whether you'll build it right  |
| `ai-wrapper-product` | Expert in building products that wrap AI APIs (OpenAI, Anthropic, etc.) into foc |
| `autonomous-agent-patterns` | Design patterns for building autonomous coding agents. Covers tool integration,  |
| `autonomous-agents` | Autonomous agents are AI systems that can independently decompose goals, plan ac |
| `browser-extension-builder` | Expert in building browser extensions that solve real problems - Chrome, Firefox |
| `chrome-extension-developer` | Expert in building Chrome Extensions using Manifest V3. Covers background script |
| `claude-code-guide` | Master guide for using Claude Code effectively. Includes configuration templates |
| `claude-d3js-skill` | Creating interactive data visualisations using d3.js. This skill should be used  |
| `computer-use-agents` | Build AI agents that interact with computers like humans do - viewing screens, m |
| `context-degradation` | Recognize patterns of context failure: lost-in-middle, poisoning, distraction, a |
| `context-fundamentals` | Understand what context is, why it matters, and the anatomy of context in agent  |
| `context-management-context-restore` | Use when working with context management context restore |
| `context-management-context-save` | Use when working with context management context save |
| `context-manager` | \| |
| `context-optimization` | Apply compaction, masking, and caching strategies |
| `context-window-management` | Strategies for managing LLM context windows including summarization, trimming, r |
| `copilot-sdk` | Build applications powered by GitHub Copilot using the Copilot SDK. Use when cre |
| `crewai` | Expert in CrewAI - the leading role-based multi-agent framework used by 60% of F |
| `gemini-api-dev` | Use this skill when building applications with Gemini models, Gemini API, workin |
| `hugging-face-cli` | Execute Hugging Face Hub operations using the `hf` CLI. Use when the user needs  |
| `hugging-face-jobs` | This skill should be used when users want to run any workload on Hugging Face Jo |
| `langchain-architecture` | Design LLM applications using the LangChain framework with agents, memory, and t |
| `llm-application-dev-ai-assistant` | You are an AI assistant development expert specializing in creating intelligent  |
| `llm-application-dev-langchain-agent` | You are an expert LangChain agent developer specializing in production-grade AI  |
| `llm-application-dev-prompt-optimize` | You are an expert prompt engineer specializing in crafting effective prompts for |
| `mcp-builder` | Guide for creating high-quality MCP (Model Context Protocol) servers that enable |
