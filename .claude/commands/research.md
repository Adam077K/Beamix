# /research — Deep Research Mode

Rex conducts structured research and returns a sourced intelligence report.

## Usage
```
/research [topic] [type: market|competitor|technology|user]
/research [topic] --depth [overview|deep]
```

## Examples

```
/research "vertical SaaS for dentists" market
/research "Linear vs Jira vs Height" competitor
/research "tRPC vs GraphQL vs REST" technology
/research "why users churn in week 2" user
```

## How Rex Works

Rex applies scientific research discipline:
1. **Strip assumptions** — start from verifiable facts only
2. **Multiple sources** — never conclude from a single source
3. **Rate everything** — ★★★ primary / ★★ secondary / ★ tertiary / [?] unverified
4. **Name conflicts** — when sources disagree, investigate the conflict
5. **Mark gaps honestly** — [?] is a valid finding, never smoothed over

## Output

Rex delivers:
- **Key Findings** — sourced, most important first
- **Evidence** — by subtopic with source ratings
- **Conflicts / Gaps** — where data is uncertain or conflicting
- **Implications** — addressed to Morgan / Nova / Axiom / Atlas

Customer language discovered → saved to `.claude/memory/USER-INSIGHTS.md`

## Depth Guide

```
overview:  30-45 min, 3-5 key findings, actionable summary
deep:      60-90 min, full evidence map, competitor pricing (dated), JTBD language
```
