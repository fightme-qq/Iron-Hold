# Animation State Machine

Use a small state machine when a character has more than idle/run.

Common states:

- `idle`
- `run`
- `jump`
- `fall`
- `attack`
- `hurt`
- `dead`

Rules:

- Give one-shot states priority over looping states.
- Use `animationcomplete` for attack/hurt/death transitions.
- Derive movement states from velocity and grounded state.
- Do not call `sprite.play(...)` every frame unless the key actually changed.
- Keep animation decisions near the entity/input system, not buried in a giant scene.
