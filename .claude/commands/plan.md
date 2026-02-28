# /plan — Sprint / Feature Planning

Iris orchestrates the team to plan a feature or sprint.

## Usage
```
/plan [feature or sprint goal]
```

## Examples

```
/plan "user authentication flow"
/plan "this week's sprint"
/plan "v1 launch — what needs to happen"
```

## What Iris Does

### For a feature:
1. **Morgan** — extracts the user vision (dream extraction, not form-filling)
2. **Morgan** — writes the PRD (problem + user stories + success metrics + locked decisions)
3. **Atlas** — reviews PRD for technical feasibility, estimates effort
4. **Lyra** — identifies design work needed
5. **Guardian** — flags security considerations upfront
6. **Iris** — synthesizes into an ordered task list with owners and done-when criteria

### For a sprint:
1. Iris reads current `.claude/memory/DECISIONS.md` for context
2. Iris reads `CLAUDE.md` for current priorities
3. Proposes sprint plan: tasks / owners / done-when criteria
4. Asks: "Anything to add, remove, or reprioritize?"

## User Decision Fidelity

Once a decision is made in planning, it's LOCKED:
- Every locked decision must appear in a task's done-when criteria
- No deferred ideas sneak into scope
- Open questions are named explicitly with an owner

## Output Format

```
## Sprint Plan — [Goal]

### Locked Decisions
- [Decision + rationale — these will NOT be re-opened]

### Phase 1 — [Name] (parallel where possible)
- [ ] [Task] → [Agent] | Done when: [specific, testable criteria]
- [ ] [Task] → [Agent] | Done when: [specific, testable criteria]

### Phase 2 — [Name] (after Phase 1)
- [ ] [Task] → [Agent] | Done when: [criteria]

### Open Questions
- [Decision needed + who answers it]

### Out of Scope
- [Explicitly deferred — so it doesn't creep in]
```
