---
name: phaser-state-machine-patterns
description: Use when gameplay objects or game flow have multiple behavior modes in a Phaser game: player states, enemy AI states, boss phases, game states, animation-independent behavior states, or when code is accumulating booleans like isAttacking/isDead/isHurt/canMove; design a small explicit state machine before adding more flags.
---

# Phaser State Machine Patterns

## Workflow

1. Read `references/state-machine-template.md` before adding behavior modes.
2. Use a state machine when an object has more than three meaningful behavior modes.
3. Name states by behavior, not by animation frame.
4. Define allowed transitions before writing update logic.
5. Keep state entry/exit side effects explicit.
6. Validate one transition path at a time.

## Rules

- Do not add many boolean flags when states are mutually exclusive.
- Keep animation state machines separate from gameplay state machines unless the behavior is tiny.
- Use events or explicit methods for transitions that affect UI, score, save, or scene flow.
- Keep state objects small enough to understand during debugging.

