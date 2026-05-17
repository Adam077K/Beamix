# /color — Set Agent Session Color

Set the badge color of the current session in the Claude Code UI. Use this to visually distinguish parallel agents running simultaneously.

## Usage
```
/color [colorname]
```

## Color Palette

### Layer 1 — CEO
| Instance | Color | When to use |
|----------|-------|-------------|
| Primary CEO | `gold` | First / only CEO session |
| Second parallel CEO | `orange` | Second CEO in a parallel worktree |
| Third parallel CEO | `teal` | Third CEO in a parallel worktree |
| Fourth parallel CEO | `lime` | Fourth CEO in a parallel worktree |

### Layer 2 — Team Leads
| Agent | Color |
|-------|-------|
| build-lead | `blue` |
| research-lead | `purple` |
| design-lead | `pink` |
| qa-lead | `red` |
| devops-lead | `orange` |
| data-lead | `teal` |
| product-lead | `green` |
| growth-lead | `yellow` |
| business-lead | `emerald` |

### Layer 3 — Workers
| Agent | Color |
|-------|-------|
| backend-developer | `blue` |
| frontend-developer | `pink` |
| database-engineer | `teal` |
| ai-engineer | `purple` |
| security-engineer | `red` |
| test-engineer | `yellow` |
| code-reviewer | `gray` |
| researcher | `purple` |
| technical-writer | `gray` |
| executor | `blue` |
| debugger | `red` |
| planner | `green` |
| verifier | `teal` |

## Rules

1. **Every session must have a color.** Default is no color — always set it explicitly.
2. **Parallel CEOs MUST use different colors.** This is how you tell them apart at a glance.
3. **Set color immediately** at the start of the identity_setup step, before any work.
4. **Color matches role** — use the table above, don't invent new assignments.

## Example
```
/color gold       → CEO primary instance
/color blue       → build-lead or backend-developer
/color red        → qa-lead or security-engineer or debugger
```

## Combined with /name
Always set both color AND name together:
```
/color gold
/name ceo-auth-redesign
```
