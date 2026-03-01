# רשימת Skills להסרה — Beamix (מלאה)

בהתבסס על הפרויקט Beamix (GEO Platform, Next.js, Supabase, Stripe, n8n, Vercel):
רשימת **~200 skills** שכנראה לא תשמש בפרויקט הזה (מעודכן — הוסרו skills שימושיים).

**סטאק:** Next.js 16, React 19, TypeScript, Supabase, Stripe, n8n Cloud, Vercel

---

## נמחק ב־2025-03-01

בוצעה מחיקה של **284 skills** מ־`~/.cursor/skills/`:

- **Azure SDK / Microsoft** (121)
- **Supply Chain / Logistics** (8)
- **Apple HIG** (13)
- **Game Development** (8)
- **Blockchain / Web3** (6)
- **Non-Stack Languages** (36)
- **Mobile Native** (3)
- **Platforms** (14)
- **Pentesting / Security Research** (31)
- **Automation Tools** (44)

**Backup:** `~/.cursor/skills-backup-20260301`  
**סקריפט:** `scripts/delete-unused-skills.sh`

---

## 1. Penetration Testing / Ethical Hacking (32)
לא רלוונטי אלא אם עוסק בכך כמקצוע. הושמטו: threat-modeling, stride — שימושיים ל־security review.

```
active-directory-attacks
api-fuzzing-bug-bounty
broken-authentication
burp-suite-testing
cloud-penetration-testing
ethical-hacking-methodology
file-path-traversal
ffuf-claude-skill
html-injection-testing
idor-testing
linux-privilege-escalation
metasploit-framework
pentest-checklist
pentest-commands
privilege-escalation-methods
red-team-tactics
red-team-tools
scanning-tools
shodan-reconnaissance
smtp-penetration-testing
sql-injection-testing
sqlmap-database-pentesting
ssh-penetration-testing
top-web-vulnerabilities
windows-privilege-escalation
wireshark-analysis
wordpress-penetration-testing
xss-html-injection
attack-tree-construction
network-101
sast-configuration
security-scanning-security-sast
security-scanning-security-hardening
security-scanning-security-dependencies
vulnerability-scanner
```

---

## 2. Reverse Engineering / Security Research (10)
מחקר אבטחה מתקדם.

```
anti-reversing-techniques
binary-analysis-patterns
firmware-analyst
malware-analyst
memory-forensics
protocol-reverse-engineering
reverse-engineer
memory-safety-patterns
```

---

## 3. Desktop / Embedded / Non-Web (10)
מערכות שלא קשורות ל־web app. הושמט: posix-shell-pro — שימושי ל־bash scripts.

```
arm-cortex-expert
avalonia-layout-zafiro
avalonia-viewmodels-zafiro
avalonia-zafiro-development
busybox-on-windows
makepad-skills
powershell-windows
claude-win11-speckit-update-skill
memory-safety-patterns
```

---

## 4. Kubernetes / Terraform / Service Mesh (25)
אין לך תשתית כזו — Vercel מטפלת.

```
cdk-patterns
cloudformation-best-practices
helm-chart-scaffolding
istio-traffic-management
k8s-manifest-generator
k8s-security-policies
kubernetes-architect
kubernetes-deployment
linkerd-patterns
service-mesh-expert
service-mesh-observability
terraform-aws-modules
terraform-infrastructure
terraform-module-library
terraform-skill
terraform-specialist
gitops-workflow
mtls-configuration
prometheus-configuration
grafana-dashboards
observability-monitoring-monitor-setup
observability-monitoring-slo-implement
```

---

## 5. Office / Document Formats (12)
פחות קריטי ל־SaaS.

```
docx
docx-official
pdf
pdf-official
pptx
pptx-official
xlsx
xlsx-official
office-productivity
nanobanana-ppt-skills
```

---

## 6. Python-First / Non-Node Stacks (18)
אתה על Next.js/TypeScript, לא Python backend.

```
async-python-patterns
fastapi-pro
fastapi-router-py
python-development-python-scaffold
python-fastapi-development
python-performance-optimization
python-patterns
python-pro
python-testing-patterns
pypict-skill
uv-package-manager
```

---

## 7. Mobile Native / Kotlin (8)
אין אפליקציית מובייל בפרויקט.

```
app-store-optimization
mobile-design
mobile-developer
mobile-security-coder
react-native-architecture
frontend-mobile-development-component-scaffold
frontend-mobile-security-xss-scan
kotlin-coroutines-expert
```

---

## 8. Other Languages / Frameworks (3)
לא חלק מהסטאק. הושמט: bun-development — עשוי להיות שימושי.

```
nestjs-expert
cloudflare-workers-expert
gcp-cloud-run
```

---

## 9. Skill Management Meta (6)
סקריפטים לעדכון skills — לא חלק מהמוצר.

```
skill-creator
skill-creator-ms
skill-developer
skill-seekers
using-superpowers
writing-skills
```

---

## 10. HR / Legal / Employment (2)
לא קשור למוצר. הושמט: legal-advisor — שימושי ל־privacy policy, ToS.

```
hr-pro
employment-contract-templates
```

---

## 11. Financial Trading / Quant (0)
אין בפרויקט.

---

## 12. Video / 3D / Graphics (7)
לא חלק מהמוצר. הושמט: claude-d3js-skill — שימושי ל־dashboards ו־charts.

```
remotion-best-practices
fal-generate
fal-image-edit
fal-upscale
fal-workflow
imagen
frontend-slides
```

---

## 13. Enterprise DevOps / On-Call (10)
Vercel מטפלת; אין צוות SRE.

```
on-call-handoff-patterns
incident-responder
incident-response-incident-response
incident-response-smart-fix
incident-runbook-templates
postmortem-writing
observability-engineer
deployment-engineer
deployment-pipeline-design
deployment-validation-config-validate
```

---

## 14. Enterprise Database / NoSQL (12)
Supabase PostgreSQL מספיק. הושמטו: database-migration, sql-pro — שימושיים.

```
database-admin
database-architect
database-cloud-optimization-cost-optimize
database-migrations-migration-observability
database-migrations-sql-migrations
database-optimizer
nosql-expert
saga-orchestration
cqrs-implementation
event-sourcing-architect
event-store-design
projection-patterns
```

---

## 15. Niche / Redundant / Unlikely (43)
הושמטו: iterate-pr, PR/code-review skills, billing-automation, hubspot, reference-builder, turborepo, nx, address-github-comments — שימושיים.

```
agent-manager-skill
antigravity-workflows
appdeploy
bazel-build-optimization
design-md
claude-scientific-skills
culture-index
dbos-typescript
obsidian-clipper-template-creator
oss-hunter
superpowers-lab
theme-factory
vexor
agentfolio
daily-news-report
infinite-gratitude
loki-mode
nerdzao-elite
nerdzao-elite-gemini-high
notion-template-business
copilot-sdk
computer-use-agents
manifest
pypict-skill
bats-testing-patterns
shellcheck-configuration
paypal-integration
pci-compliance
twilio-communications
interactive-portfolio
personal-tool-builder
sales-automator
customer-support
bullmq-specialist
upstash-qstash
monorepo-architect
monorepo-management
multi-cloud-architecture
hybrid-cloud-architect
hybrid-cloud-networking
cost-optimization
google-analytics-automation
gitlab-automation
gitlab-ci-patterns
```

---

## סיכום — רשימה שטוחה מלאה

<details>
<summary>לחץ להרחבה</summary>

```
active-directory-attacks
agent-manager-skill
agentfolio
anti-reversing-techniques
antigravity-workflows
api-fuzzing-bug-bounty
app-store-optimization
appdeploy
arm-cortex-expert
async-python-patterns
attack-tree-construction
avalonia-layout-zafiro
avalonia-viewmodels-zafiro
avalonia-zafiro-development
bats-testing-patterns
bazel-build-optimization
binary-analysis-patterns
broken-authentication
bullmq-specialist
burp-suite-testing
busybox-on-windows
cdk-patterns
claude-scientific-skills
claude-win11-speckit-update-skill
cloud-penetration-testing
cloudformation-best-practices
cloudflare-workers-expert
culture-index
customer-support
daily-news-report
database-admin
database-architect
database-cloud-optimization-cost-optimize
database-migrations-migration-observability
database-migrations-sql-migrations
database-optimizer
dbos-typescript
deployment-engineer
deployment-pipeline-design
deployment-validation-config-validate
design-md
docx
docx-official
employment-contract-templates
ethical-hacking-methodology
event-sourcing-architect
event-store-design
fal-generate
fal-image-edit
fal-platform
fal-upscale
fal-workflow
fastapi-pro
fastapi-router-py
ffuf-claude-skill
file-path-traversal
firmware-analyst
frontend-mobile-development-component-scaffold
frontend-mobile-security-xss-scan
frontend-slides
gcp-cloud-run
grafana-dashboards
gitops-workflow
helm-chart-scaffolding
hr-pro
html-injection-testing
hybrid-cloud-architect
hybrid-cloud-networking
idor-testing
imagen
incident-responder
incident-response-incident-response
incident-response-smart-fix
incident-runbook-templates
infinite-gratitude
interactive-portfolio
istio-traffic-management
k8s-manifest-generator
k8s-security-policies
kotlin-coroutines-expert
kubernetes-architect
kubernetes-deployment
linkerd-patterns
linux-privilege-escalation
loki-mode
makepad-skills
malware-analyst
memory-forensics
memory-safety-patterns
metasploit-framework
mobile-design
mobile-developer
mobile-security-coder
monorepo-architect
monorepo-management
mtls-configuration
multi-cloud-architecture
nanobanana-ppt-skills
nestjs-expert
network-101
nerdzao-elite
nerdzao-elite-gemini-high
nosql-expert
notion-template-business
observability-engineer
observability-monitoring-monitor-setup
observability-monitoring-slo-implement
obsidian-clipper-template-creator
office-productivity
on-call-handoff-patterns
oss-hunter
paypal-integration
pci-compliance
pdf
pdf-official
pentest-checklist
pentest-commands
powershell-windows
pptx
pptx-official
privilege-escalation-methods
projection-patterns
prometheus-configuration
protocol-reverse-engineering
pypict-skill
python-development-python-scaffold
python-fastapi-development
python-performance-optimization
python-patterns
python-pro
python-testing-patterns
react-native-architecture
red-team-tactics
red-team-tools
remotion-best-practices
reverse-engineer
sales-automator
saga-orchestration
sast-configuration
scanning-tools
shellcheck-configuration
shodan-reconnaissance
skill-creator
skill-creator-ms
skill-developer
skill-seekers
smtp-penetration-testing
sql-injection-testing
sqlmap-database-pentesting
ssh-penetration-testing
superpowers-lab
terraform-aws-modules
terraform-infrastructure
terraform-module-library
terraform-skill
terraform-specialist
theme-factory
top-web-vulnerabilities
twilio-communications
upstash-qstash
using-superpowers
uv-package-manager
vexor
vulnerability-scanner
web-artifacts-builder
windows-privilege-escalation
wireshark-analysis
wordpress-penetration-testing
writing-skills
xlsx
xlsx-official
xss-html-injection
```

</details>

---

## Skills שכן להשאיר (רלוונטיים ל-Beamix)

- **Next.js/React:** nextjs-app-router-patterns, nextjs-best-practices, nextjs-supabase-auth, react-*
- **SEO/GEO:** geo-fundamentals, seo-*, programmatic-seo, schema-markup
- **AI/LLM:** ai-engineer, rag-engineer, langgraph, llm-*, prompt-engineering
- **n8n:** n8n-code-python, n8n-mcp-tools-expert, n8n-node-configuration
- **Payments:** stripe-integration
- **Jobs:** inngest, trigger-dev
- **Content:** copywriting, content-creator, content-marketer
- **Deploy:** vercel-deployment
- **Testing:** e2e-testing, testing-patterns, playwright-skill
- **Design:** frontend-design, tailwind-*, radix-ui-design-system
- **Database:** postgres-best-practices, postgresql, prisma-expert
- **TypeScript/Node:** typescript-*, nodejs-*

---

**סה"כ להסרה:** ~200 skills  
**נותרים:** ~380 skills שימושיים
