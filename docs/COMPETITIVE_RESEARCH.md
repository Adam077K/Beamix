> ⚠️ **DUPLICATE** — This is a copy of `docs/02-competitive/LANDSCAPE.md`.
> Refer to the `02-competitive/` folder for the maintained version.
> *Noted: 2026-03-05*

# מחקר מתחרים מעמיק — Beamix GEO Platform

> **תאריך:** מרץ 2026 2
> **מטרה:** ניתוח מעמיק של 15 מתחרים בשוק ה-GEO/AEO — מוצרים, פיצ'רים, דאשבורדים, מעקב פרמטרים, סוכנים, תמחור, ובידול
> **Repository:** https://github.com/Adam077K/Beamix

---

## Executive Summary

שוק ה-GEO (Generative Engine Optimization) צומח ב-34% CAGR ל-$7.3B עד 2031. ניתחנו 15 מתחרים לעומק וזיהינו:

1. **אף מתחרה לא משלב תמחור SMB ($49) + סוכני AI שעושים עבודה + סריקה חינמית + עברית** — Beamix היחידה
2. **Enterprise dominates**: Profound ($99-Enterprise), AthenaHQ ($295+), Goodie ($495+), Bear ($200+), Scrunch ($100-500) — כולם יקרים מדי ל-SMB
3. **Budget tools = monitoring only**: Otterly ($29), Airefs ($24), RankPrompt ($29) — רק מעקב, בלי פעולה
4. **Content generation נדיר**: רק Profound Agents, Bear AI, Gauge, ו-RankPrompt מייצרים תוכן — כולם ב-enterprise pricing (חוץ מ-RankPrompt)
5. **Beamix's blue ocean**: תמחור SMB + agents שעושים עבודה + free scan hook + עברית RTL

---

## 1. Profound

**אתר:** [getprofound.ai](https://www.tryprofound.com) | **קטגוריה:** Enterprise GEO Leader

### סקירה
פלטפורמת Enterprise לניטור נוכחות מותג ב-AI search. G2 Winter 2026 Leader. גייסה $58.5M (Khosla, Kleiner Perkins, NVIDIA, Sequoia). לקוחות: Ramp, DocuSign, Figma, 10% מ-Fortune 500.

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **Answer Engine Insights** | ניטור נוכחות מותג — כמה פעמים מוזכר, דירוג מול מתחרים, מגמות sentiment |
| **Prompt Volumes** | dataset קנייני — הערכת volume של שיחות LLM לפי נושא (פריצת דרך) |
| **Conversation Explorer** | חיפוש real-time בשיחות AI — מה אנשים שואלים על הנישה שלך |
| **Opportunities Engine** | זיהוי פערים — מה חסר באסטרטגיית התוכן, ranked by effort/impact |
| **Profound Agents** | סוכנים אוטונומיים — כותבים articles, briefs, landing pages, research. משתלבים עם Slack, WordPress, Sanity, Contentful, Gamma |
| **Agent Analytics** | מדידת impact של agents — מה GA4/Cloudflare לא תופסים |
| **Enterprise Security** | SOC 2 Type II, SSO/SAML |

### AI Engines
ChatGPT, Perplexity, Claude, Gemini, Grok, Copilot, Meta AI, DeepSeek, Google AI Overviews (10+)

### דאשבורד
Brand visibility score, per-platform breakdown, competitor comparison, sentiment trends, opportunities list ranked by impact, agent activity feed

### תמחור
| Plan | מחיר | מה כלול |
|------|-------|---------|
| Starter | $99/mo | ChatGPT בלבד, 50 prompts, 1 user |
| Growth | $399/mo | ChatGPT + Perplexity + AI Overviews, 100 prompts, 6 articles/mo |
| Enterprise | Custom | 10+ engines, unlimited, SSO, Slack, SOC2 |

> 48% יותר יקר מהממוצע בשוק. Profound הוא data-heavy ו-unintuitive לפי משתמשים.

### חוזקות
- Brand equity ענקי, VC backed, SOC 2
- Prompt Volumes — נתון קנייני שאין לאף אחד אחר
- Agents שכותבים ומפרסמים ישירות ב-CMS

### חולשות (הזדמנויות ל-Beamix)
- אין Free Trial — צריך להגיש בקשה
- $99 entry — רק ChatGPT, מאוד מוגבל
- UI מורכב — "data-heavy and unintuitive"
- מכוון ל-Fortune 500, לא SMBs
- אין עברית

---

## 2. AthenaHQ

**אתר:** [athenahq.ai](https://athenahq.ai) | **קטגוריה:** Premium GEO + Action

### סקירה
פלטפורמת GEO SaaS ל-marketing, brand, ו-growth teams. נבנתה ע"י מומחי Google Search ו-DeepMind. מציעה Athena Citation Engine (ACE) — עמוק ב-brand narrative.

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **Prompt Analysis** | ניתוח prompts — visibility, ranking, sentiment per platform |
| **Action Center** | המלצות פעולה — content gaps, citation opportunities |
| **E-commerce Module** | Shopify + GA4 integration — חיבור AI visibility לדולרים |
| **Monitoring** | daily monitoring עד מאות אלפי prompts (enterprise) |
| **Athena Citation Engine (ACE)** | ניתוח עמוק של brand narrative — מה AI אומר עליך ולמה |
| **Competitive Insights** | ניתוח מתחרים — מה הם עושים ב-GEO |

### AI Engines
ChatGPT, Perplexity, Claude, Gemini, Google AI Overviews, Copilot

### תמחור
| Plan | מחיר | מה כלול |
|------|-------|---------|
| List | $295/mo | 3,600 credits/mo |
| Growth | $595/mo | 8,000 credits/mo |
| Enterprise | Custom | Multi-country, ACE, GEO specialist, Slack, SSO, 2hr SLA |

> אין free trial. Premium market segment בלבד.

### חוזקות
- Action Center — לא רק monitoring, גם recommendations
- E-commerce integration (Shopify + GA4 → revenue attribution)
- ACE — ניתוח brand narrative ייחודי

### חולשות
- $295 minimum — יקר מדי ל-SMB
- אין free trial
- Credit-based — יכול להיות מבלבל
- מרגיש כלי למחקר, לא לביצוע

---

## 3. Gauge

**אתר:** [withgauge.com](https://www.withgauge.com) | **קטגוריה:** AI Visibility + Content Engine

### סקירה
פלטפורמת AI visibility שמשלבת monitoring עם content generation engine. Action Center עם המלצות מבוססות research.

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **AI Response Monitoring** | מעקב brand mentions across כל פלטפורמות AI |
| **Citation Analysis** | סריקת אלפי citations — מי מצוטט, מי לא, ואיך brand עומד מול מתחרים |
| **Action Center** | המלצות prioritized — content gaps ו-citation opportunities |
| **Content Engine** | ייצור articles אוטומטי — optimized ל-AI readability |
| **Research-Backed Prompts** | מיפוי search intent ל-pain points — לא רק "best X" queries אלא use cases ספציפיים |
| **Volume Data** | keyword research → prompt generation עם volume data |

### AI Engines
ChatGPT, Claude, Gemini, Perplexity, CoPilot, AI Mode, AI Overviews

### תמחור
| Plan | מחיר | מה כלול |
|------|-------|---------|
| Starter | $100/mo | 100 prompts, ChatGPT only, 3 articles/mo |
| Growth | $599/mo | 600 prompts, all models, 18 articles/mo |
| Enterprise | Custom | 10+ engines, unlimited |

### חוזקות
- Content Engine — מייצר articles, לא רק monitoring
- Research-backed prompt strategy — pain points, לא רק keywords
- Action Center עם prioritized recommendations

### חולשות
- $100 entry Starter — רק ChatGPT
- $599 Growth — יקר ל-SMB
- אין free scan / free trial

---

## 4. Otterly AI

**אתר:** [otterly.ai](https://otterly.ai) | **קטגוריה:** Budget GEO Monitoring

### סקירה
כלי GEO monitoring הזול ביותר בשוק. מוקד: מעקב visibility, לא ייצור תוכן. Workspaces למנהלים עם מספר brands/clients.

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **Search Prompt Monitoring** | בדיקה יומית אוטומטית של prompts — בונה היסטוריה של תשובות AI לאורך זמן |
| **Brand Coverage Rate** | אחוז הפעמים שהמותג מוזכר |
| **Share of Voice** | השוואה מול מתחרים — מי מקבל יותר exposure |
| **Platform Visibility** | breakdown per platform — visibility trends |
| **GEO Audit** | 25+ ranking factors ניתוח |
| **Workspaces** | ניהול מספר brands/clients בחשבון אחד |
| **Agency Tools** | white-label reports, multi-brand management |

### AI Engines
ChatGPT, Perplexity, Google AI Overviews, Google AI Mode, Gemini, Microsoft Copilot

### תמחור
| Plan | מחיר | מה כלול |
|------|-------|---------|
| Lite | $29/mo | 15 prompts |
| Standard | $189/mo | 100 prompts |
| Premium | $489/mo | 400 prompts |

> יש trial עם full functionality

### חוזקות
- Entry price נמוך ($29)
- UX נקי ופשוט
- GEO Audit מפורט (25+ factors)
- Agency-friendly (workspaces)

### חולשות
- **Monitoring ONLY — לא מייצר תוכן**
- "אני רואה נתונים — מה עכשיו?" — אין action layer
- 15 prompts ב-$29 — מוגבל מאוד
- Jump ל-$189 — יקר ל-SMB שרוצה יותר

---

## 5. SE Visible

**אתר:** [visible.seranking.com](https://visible.seranking.com) | **קטגוריה:** GEO Analytics by SE Ranking

### סקירה
מוצר GEO של SE Ranking — פלטפורמת SEO ותיקה. Focus על visibility, perception, ו-competitive positioning ב-AI search. אוסף תשובות AI אמיתיות (לא סימולציות).

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **Visibility Score** | ציון visibility מרכזי + rank מול מתחרים |
| **Average Placement** | מיקום ממוצע של המותג בתשובות AI |
| **Net Sentiment Score** | ציון sentiment כולל (חיובי/שלילי/נייטרלי) |
| **Competitive Benchmarking** | השוואת AI presence מול מתחרים — visibility gaps, positioning, growth opportunities |
| **Auto Competitor Suggestions** | המלצות אוטומטיות למתחרים רלוונטיים (בפיתוח 2026) |
| **Prompt Suggestions** | הצעות prompts לפי נישה — filter by engine, topic, competitor, sentiment |
| **Topic Grouping** | קיבוץ prompts לפי נושאים — ניווט קל |
| **Real AI Responses** | נתונים מתשובות AI אמיתיות — לא סימולציות |

### AI Engines
ChatGPT, Perplexity, Gemini, Google AI Mode, Google AI Overviews

### תמחור
חלק מחבילות SE Ranking (~$55-100/mo). לא clear standalone pricing.

### חוזקות
- חלק מ-SE Ranking — brand name מוכר
- Real AI responses (לא סימולציות)
- Auto competitor suggestions
- SMB-friendly pricing

### חולשות
- **לא standalone product** — צריך SE Ranking subscription
- אין content generation
- אין agents/automation
- GEO הוא secondary ל-SEO tool
- כיסוי engines מוגבל (5 בלבד)

---

## 6. Writesonic GEO

**אתר:** [writesonic.com](https://writesonic.com) | **קטגוריה:** All-in-One AI Marketing + GEO

### סקירה
פלטפורמת שיווק AI all-in-one שכוללת GEO tracking + content generation. 120M שיחות AI chatbot כ-dataset קנייני. G2: 4.7/5 (2,065+ reviews), Trustpilot: 4.7/5 (5,810 reviews).

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **AI Visibility Tracking** | visibility score, share of voice, sentiment tracking |
| **Prompt Explorer** | חקירת prompts רלוונטיים עם volume data מ-120M שיחות |
| **Content Generation** | blogs, ads, social media content, landing pages |
| **SEO + GEO Combined** | traditional SEO tools + AI visibility |
| **Sentiment Analysis** | ניתוח sentiment לפי platform |

### AI Engines
ChatGPT, Perplexity, Gemini, Claude, Copilot, Grok, Meta AI, Google AI Overviews (8+)

### תמחור
| Plan | מחיר | GEO כלול? |
|------|-------|-----------|
| Lite | $49/mo | **לא** |
| Standard | $99/mo | **לא** |
| Professional | $249/mo | **כן** — כאן מתחיל GEO |
| Advanced | $499/mo | כן — 300 prompts daily |

> **הבעיה הגדולה:** GEO לא כלול ב-$49 או $99! צריך $249+ לקבל AI visibility features.

### חוזקות
- Content generation חזק
- Dataset קנייני (120M שיחות)
- Coverage רחב (8+ engines)
- Brand מוכר

### חולשות
- **GEO נעול מאחורי $249+** — misleading pricing
- Credits לא מצטברים (expire)
- תוכן דורש עריכה משמעותית
- Billing issues (תלונות Trustpilot)
- ממשק מורכב

---

## 7. Bear AI

**אתר:** [usebear.ai](https://www.usebear.ai) | **קטגוריה:** Marketing Stack for AI Agents (YC F25)

### סקירה
"The Marketing Stack for AI Agents." YC-backed (Fall 2025), SF-based. מתמקד בהמרת traffic מ-AI agents ללקוחות. גם design reference של Beamix.

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **AI Mention Tracking** | real-time dashboard — מתי, איפה, ואיך AI agents מדברים עליך |
| **Blog Agent** | מייצר blog posts structured ל-AI readability — optimized לפי prompts שהקהל שואל |
| **PR Outreach Tools** | בניית citations ו-third-party mentions |
| **Competitor Analysis** | מעקב 4-5 מתחרים (Basic), unlimited (Pro) |
| **AI Attribution** | חיבור AI visibility ל-actual conversions |
| **Content Optimization** | תוכן מותאם ל-LLM ingestion |

### AI Engines
ChatGPT, Google AI Mode, Claude, Gemini, Perplexity

### תמחור
מתחיל ב-$200/mo. Plans "straightforward and predictable" — לא credit-based.

> תוצאות: 4-6 שבועות לשיפור מדיד ב-AI visibility

### חוזקות
- YC backed — credibility
- Blog Agent מייצר תוכן optimized
- UI מעולה (design reference של Beamix)
- Content + monitoring combo

### חולשות
- $200/mo — יקר ל-SMB קטן
- עדיין early stage
- אין free scan
- אין עברית

---

## 8. Goodie AI

**אתר:** [higoodie.com](https://higoodie.com) | **קטגוריה:** Enterprise GEO + Attribution

### סקירה
פלטפורמת GEO from day one — monitoring + optimization + attribution + content intelligence. מכוון ל-mid-market ו-enterprise.

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **Brand Visibility Score** | ציון visibility per AI model |
| **Sentiment Analysis** | ניתוח sentiment per brand, topic, model |
| **Topic Visibility** | visibility לפי נושא — top brands analysis |
| **AI Attribution Analytics** | מעקב AI-driven sessions → conversions → revenue |
| **Content Generation** | GEO + SEO optimized content |
| **Technical GEO Tools** | semantic text insertions, optimization tools |

### AI Engines
ChatGPT, Gemini, Perplexity, Claude, Copilot, DeepSeek

### תמחור
מתחיל ב-$495/mo (שנתי) / $645/mo (חודשי). Scales with complexity.

### חוזקות
- Built for GEO from day one (לא SEO add-on)
- AI attribution → revenue
- UI approachable גם ל-non-technical
- Content generation + technical GEO

### חולשות
- **$495/mo — לא ריאלי ל-SMBs**
- בנוי עבור agencies/QBRs
- אין free trial
- אין free scan

---

## 9. RankScale

**אתר:** [rankscale.ai](https://rankscale.ai) | **קטגוריה:** Budget GEO + Website Audit

### סקירה
פלטפורמת AI visibility שמתמקדת ב-website audits ו-AI readiness scoring. Entry price נמוך מאוד ($20/mo).

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **AI Visibility Tracking** | מעקב visibility across AI engines |
| **Website Audit** | AI readiness scores, content performance, optimization paths |
| **Multi-Page Crawl** | סריקת מספר דפים — זיהוי חולשות |
| **Content Comparison** | השוואת original vs AI-optimized versions |
| **Sentiment Tracking** | ניתוח sentiment per engine per topic |
| **Competitor Benchmarking** | השוואת מתחרים across AI engines |
| **Citation Analysis** | ניתוח citations מפורט |

### AI Engines
ChatGPT, Perplexity, Claude, Gemini, AI Overviews, Mistral, Grok

### תמחור
| Plan | מחיר | מה כלול |
|------|-------|---------|
| Essentials | $20/mo | 120 credits |
| Pro | $99/mo | 1,200 credits |
| Enterprise | $780/mo | 12,000 credits |

> Credit-based system — flexible usage (prompts, audits, tracking)

### חוזקות
- **$20 entry — הזול ביותר בשוק**
- Website audit ייחודי — AI readiness scoring
- Coverage רחב (7 engines כולל Mistral)
- Content comparison tool

### חולשות
- Credit-based — יכול להתבלבל
- אין content generation
- אין agents/automation
- UI/UX לא ברמת premium

---

## 10. Peec AI

**אתר:** [peec.ai](https://peec.ai) | **קטגוריה:** SMB/Agency GEO Monitoring

### סקירה
פלטפורמת AI search visibility analytics. Focus על prompt tracking, competitive benchmarking, ו-regional tracking (multi-market).

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **Dashboard** | visibility %, industry ranking table, recent mentions with context, sources summary |
| **Prompt Tracking** | auto-suggest prompts based on website content. Position, sentiment, visibility % per prompt |
| **Competitor Analysis** | suggested competitors by category, mention counts, add any brand |
| **Regional Tracking** | competitor tracking per region — multi-market brands |
| **Sentiment Analysis** | positive/neutral/negative tracking per brand |
| **Prompt Calculation** | 25 prompts × 3 models × 30 days = 2,250 AI answers analyzed |

### AI Engines
ChatGPT, Perplexity, Google AI Overviews, Gemini, Claude, DeepSeek, Llama, Grok (8)

### תמחור
| Plan | מחיר | מה כלול |
|------|-------|---------|
| Starter | €89/mo | 25 prompts, startups |
| Pro | €199/mo | 100+ prompts |
| Enterprise | Custom | Advanced features |

### חוזקות
- Auto-suggest prompts (saves setup time)
- Regional tracking (differentiator)
- Coverage רחב (8 engines כולל DeepSeek, Llama)
- Easy UX

### חולשות
- **Monitoring only — אין content generation**
- €89 ($95) entry — יותר יקר מ-Beamix
- אין free scan
- אין agents

---

## 11. Scrunch AI

**אתר:** [scrunch.com](https://scrunch.com) | **קטגוריה:** Enterprise AI Customer Experience

### סקירה
פלטפורמת "AI Customer Experience" — monitoring + persona-based tracking + Agent Experience Platform (AXP). Focus על B2B SaaS.

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **AI Visibility Monitoring** | trends, citations, competitors, rankings per prompt |
| **AI Crawler Feed** | real-time feed — איך AI bots סורקים את האתר שלך |
| **Persona-Based Tracking** | יצירת personas → monitoring נפרד per target audience |
| **Competitive Analysis** | competitor, persona, topic, geo — multi-dimensional |
| **GA Integration** | AI crawler analysis + traffic attribution |
| **Site Audits** | בדיקה שדפים מרכזיים visible ל-AI bots |
| **Agent Experience Platform (AXP)** | "shadow site" — AI-optimized content ל-bots, human experience unchanged |

### AI Engines
ChatGPT, Gemini, Perplexity, Claude, Meta AI, Google AI Mode, Google AI Overviews (7)

### תמחור
| Plan | מחיר | מה כלול |
|------|-------|---------|
| Explorer | $100/mo | ChatGPT בלבד |
| Growth | $500/mo | All LLMs, 700 prompts, 5 personas, 10 page audits |
| Enterprise | Custom | Full access |

> אין self-serve demo/trial. Sales call required.

### חוזקות
- AXP — shadow site ייחודי (אף מתחרה אחר לא מציע)
- Persona-based tracking
- Clean UI, quick onboarding
- AI crawler analysis

### חולשות
- **$100 entry — רק ChatGPT**
- $500 ל-full coverage — enterprise pricing
- אין actionable recommendations — "tells you what, not what to do"
- אין free trial
- Sales call required

---

## 12. Airefs

**אתר:** [getairefs.com](https://getairefs.com) | **קטגוריה:** Budget Source-Level AEO Tracking

### סקירה
"Google Search Console for AI answers." מציג בדיוק אילו articles, Reddit threads, ופורומים ש-AI מצטט — ואז אומר אילו מהם ליצור, לעדכן, או להצטרף.

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **Source-Level Tracking** | מציג URLs ספציפיים ש-AI models מצטטים — לא רק visibility score |
| **Share of Voice** | מעקב brand vs competitors across LLMs |
| **Daily Data Refresh** | עדכון יומי |
| **Actionable Citations** | רשימת pages ליצור, לעדכן, או לפעול בהם |

### תמחור
| Plan | מחיר | מה כלול |
|------|-------|---------|
| Lite | $24/mo | 1 domain, 25 prompts |
| Pro | $49/mo | 3 domains, 60 prompts, daily refresh |

> 7-day free trial, no credit card required

### חוזקות
- **$24 entry — הזול ביותר אחרי RankScale**
- Source-level tracking — ייחודי ב-price range הזה (בד"כ $200-300)
- Actionable — אומר מה ליצור/לעדכן
- Free trial ללא כרטיס

### חולשות
- אין content generation
- מוגבל — 25 prompts ב-Lite
- אין agents/automation
- New player — less proven

---

## 13. Spotlight

**אתר:** [get-spotlight.com](https://www.get-spotlight.com) | **קטגוריה:** Full-Stack AI Conversational Visibility

### סקירה
פלטפורמת full-stack ל-AI conversational visibility. Prompt volume tracking, sentiment scoring, citation tracking, content gap analysis, ו-AI-driven content suggestions.

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **Multi-AI Platform Monitoring** | unified view — visibility, position, sentiment across all major chatbots |
| **Prompt Volume Tracking** | proprietary tool — prompts שבאמת חשובים |
| **Sentiment Scoring** | per brand, per platform |
| **Citation Tracking** | מי מצוטט ואיפה |
| **Content Gap Analysis** | זיהוי content gaps |
| **AI Content Suggestions** | המלצות לתוכן based on data |
| **GA Integration** | Google Analytics integration |
| **Brand Reputation Scoring** | ציון reputation ב-AI chatbots |

### AI Engines
ChatGPT, Google AI Overviews, Google AI Mode, Grok, Gemini, Claude, Perplexity, Copilot (8)

### תמחור
לא ברור — likely mid-market to enterprise pricing. Custom/sales-based.

### חוזקות
- Full-stack coverage (8 engines)
- Prompt volume tracking proprietary
- Content suggestions — actionable
- Brand reputation scoring ייחודי

### חולשות
- Pricing לא transparent
- Likely expensive
- אין free scan
- New brand — less proven

---

## 14. Rank Prompt

**אתר:** [rankprompt.com](https://rankprompt.com) | **קטגוריה:** Affordable AEO + Content Generation

### סקירה
"First dedicated AEO platform." משלב monitoring עם optimization ו-content generation. Near real-time monitoring (15-30 min). Multi-language ו-multi-region בכל plan.

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **Prompt Monitoring** | browser-based front-end capture — mentions, ranking, sources, content recommendations |
| **Near Real-Time** | updates within 15-30 min (vs daily/weekly competitors) |
| **Content Generation** | 6 content types: comparison articles, ranked lists, location pages, case studies, product deep-dives, FAQ articles |
| **Schema Recommendations** | markup enhancements based on competitor analysis |
| **Multi-Language** | all plans include multi-language + multi-region testing |
| **Anonymous Competitor Monitoring** | מעקב מתחרים ללא ידיעתם |
| **SEO Audit** | site audit כלול |

### AI Engines
ChatGPT, Gemini, Perplexity, Claude, Grok (5)

### תמחור
| Plan | מחיר | מה כלול |
|------|-------|---------|
| Starter | $29/mo | 150 credits |
| Pro | $89/mo | 500 credits |
| Agency | $149/mo | 1,000 credits, 10-20 clients, white-label |

> 1 credit = 1 prompt across all 5 engines. 10 credits = 1 article. Free trial: 50 credits.

### חוזקות
- **$29 entry עם content generation — ייחודי**
- 6 content types optimized ל-LLM
- Near real-time (15-30 min)
- Multi-language in all plans
- Free trial (50 credits)

### חולשות
- Credit system — 10 credits per article = limited capacity
- 5 engines בלבד
- Browser-based capture — less reliable than API
- Small team — reliability risk

---

## 15. Ahrefs Brand Radar

**אתר:** [ahrefs.com/brand-radar](https://ahrefs.com/brand-radar) | **קטגוריה:** SEO Giant + AI Monitoring Add-on

### סקירה
מוצר Brand Radar של Ahrefs — ניטור brand mentions ב-AI search + traditional web. Database של 239M+ real user prompts. Launched January 2026.

### פיצ'רים
| פיצ'ר | פירוט |
|--------|--------|
| **AI Prompt Database** | 239M+ real user prompts — ניתוח visibility |
| **Brand Mention Tracking** | Google AI Overviews, ChatGPT, Perplexity + traditional web (news, blogs, forums) |
| **YouTube/TikTok/Reddit** | מעקב mentions across video platforms ו-Reddit |
| **Custom Prompt Tracking** | בחירת prompts ספציפיים למעקב |
| **Competitor Comparison** | השוואת brands per prompt |
| **Traditional SEO Integration** | linked + unlinked citations, backlinks — Ahrefs core strength |

### AI Engines
Google AI Overviews, ChatGPT, Perplexity (3 AI + YouTube/TikTok/Reddit/Web)

### תמחור
- $199/mo per AI index
- $699/mo for all 6 indexes bundled
- On top of base Ahrefs subscription ($129+/mo)
- Custom prompt tracking: 2,500 checks/mo, $0.020/check overage

> סה"כ: $328-$828+/mo (Ahrefs base + Brand Radar)

### חוזקות
- Ahrefs brand name — massive trust
- 239M real prompt database
- SEO + AI combined — full picture
- YouTube/TikTok/Reddit tracking

### חולשות
- **בעיות accuracy חמורות**: בבדיקה, ChatGPT module דיווח 3 mentions כש-manually נמצאו 123. Perplexity: 6 vs 212 actual
- יקר מאוד ($328+/mo minimum)
- Requires existing Ahrefs subscription
- אין content generation
- אין agents
- Still experimental (launched Jan 2026)

---

## טבלת השוואה מקיפה

| מתחרה | Entry Price | AI Engines | Content Gen | Agents | Free Scan/Trial | SMB-Friendly | Hebrew |
|--------|------------|------------|-------------|--------|-----------------|--------------|--------|
| **Beamix** | **$49/mo** | **4-10** | **AI Agents** | **6 agents** | **Free scan** | **כן** | **כן** |
| Profound | $99/mo | 10+ | Agents | כן | לא | לא | לא |
| AthenaHQ | $295/mo | 6 | Recommendations | לא | לא | לא | לא |
| Gauge | $100/mo | 7 | Content Engine | לא | לא | לא | לא |
| Otterly AI | $29/mo | 6 | לא | לא | Trial | כן | לא |
| SE Visible | ~$55/mo | 5 | לא | לא | Trial | כן | לא |
| Writesonic | $249/mo (GEO) | 8+ | כן | לא | Trial (no GEO) | לא | לא |
| Bear AI | $200/mo | 5 | Blog Agent | כן | לא | לא | לא |
| Goodie AI | $495/mo | 6 | כן | לא | לא | לא | לא |
| RankScale | $20/mo | 7 | לא | לא | לא | כן | לא |
| Peec AI | €89/mo | 8 | לא | לא | לא | כן | לא |
| Scrunch AI | $100/mo | 7 | AXP (shadow) | לא | לא | לא | לא |
| Airefs | $24/mo | N/A | לא | לא | 7-day trial | כן | לא |
| Spotlight | N/A | 8 | Suggestions | לא | לא | N/A | לא |
| Rank Prompt | $29/mo | 5 | 6 types | לא | 50 credits | כן | לא |
| Ahrefs Brand Radar | $328+/mo | 3 AI | לא | לא | לא | לא | לא |

---

## ניתוח SWOT ל-Beamix מול כל המתחרים

### Strengths (חוזקות Beamix)
1. **תמחור SMB ($49/mo) + agents שעושים עבודה** — שילוב שאף מתחרה לא מציע
2. **Free scan כ-viral hook** — day-1 value, אף מתחרה Enterprise לא מציע
3. **עברית RTL** — zero competition בישראל
4. **6 AI agents** — Content, Blog, Review, Schema, Social, Recommendations
5. **UX ל-non-technical** — בעל עסק, לא SEO professional

### Weaknesses (חולשות Beamix)
1. Solo founder — scalability risk
2. Mock data — scan engine ו-agents עדיין לא live
3. Brand awareness = 0 — vs Profound ($58.5M), Bear (YC), Ahrefs (legacy)
4. AI engine coverage — 4 free, 8 pro (vs 10+ של Profound)
5. No enterprise features (SSO, SOC2, API)

### Opportunities (הזדמנויות)
1. **SMB gap** — אין כלי ב-$49 שעושה monitoring + content + agents
2. **Israel first mover** — שוק ישראלי פתוח לחלוטין
3. **"Does the work" positioning** — ברור, פשוט, differentiated
4. **Free scan viral loop** — כל SMB owner רוצה לדעת אם הוא "נראה ב-AI"
5. **Rank Prompt as model** — $29/mo + content works, Beamix can do it better at $49

### Threats (איומים)
1. Profound Agents coming down-market
2. Ahrefs/SEMrush adding better AI features to existing user base
3. New YC-backed competitors (Bear, Relixir)
4. LLM API costs making agents expensive to operate
5. Market consolidation — big players acquiring small ones

---

## המלצות אסטרטגיות (Updated March 2026)

### 1. Positioning Statement
> "כל הכלים האחרים מראים לך שאתה לא נמצא ב-ChatGPT. Beamix מתקנת את זה בשבילך — ב-$49 לחודש."

### 2. Competitive Battlecards

| כשלקוח אומר... | התשובה שלנו |
|----------------|-------------|
| "Profound יותר טוב" | "Profound מתחיל ב-$99 רק ל-ChatGPT. ב-$49 אתה מקבל 3 engines + agents שכותבים תוכן" |
| "Otterly רק $29" | "Otterly מראה data. Beamix כותבת לך את התוכן שמתקן את הבעיה" |
| "Writesonic ב-$49" | "GEO features ב-Writesonic מתחילים ב-$249. ב-$49 שלנו אתה מקבל GEO + agents" |
| "Ahrefs כבר יש לי" | "Brand Radar דיווח 3 mentions מתוך 123 בבדיקה. ויש לו בעיות accuracy חמורות" |
| "Bear AI יפה יותר" | "Bear מתחיל ב-$200. אנחנו ב-$49 עם אותם agents" |
| "RankPrompt ב-$29" | "RankPrompt מצוין ל-monitoring. אנחנו agents שכותבים ומפרסמים — לא רק מראים" |

### 3. 3 Features שנותנים Beamix unfair advantage
1. **Free Scan** — viral, zero friction, day-1 value (Profound/AthenaHQ/Goodie/Bear = אין)
2. **AI Agents at SMB price** — Profound Agents = Enterprise, Bear = $200, Gauge = $599. Beamix = $49
3. **Hebrew RTL** — 0 competition. 100% of Israeli SMB market available

---

*מסמך זה נכתב על בסיס מחקר web חי (מרץ 2026). מקורות: G2, Rankability, getmint.ai, TryAnalyze, OMR Reviews, SearchInfluence, Writesonic, AthenaHQ, Profound, Gauge, Otterly AI, SE Visible, Bear AI, Goodie AI, RankScale, Peec AI, Scrunch AI, Airefs, Spotlight, RankPrompt, Ahrefs Brand Radar, PitchBook, YCombinator, BusinessWire.*
