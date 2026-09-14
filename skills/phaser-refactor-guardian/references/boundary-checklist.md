# Boundary Checklist

Before editing:

- Which files need to change?
- Which existing pattern is closest?
- Does this belong in:
  - `scenes/` for lifecycle and orchestration;
  - `systems/` for reusable gameplay rules;
  - `entities/` for sprite/body setup;
  - `input/` for raw input to intent;
  - `ui/` for HUD/menus/overlays;
  - `state/` for runtime values;
  - `save/` for persistence;
  - `data/` for tunable definitions?
- Is `GameScene` growing because it owns logic that could be a system?
- Are constants/data repeated?
- Are event listeners cleaned up on shutdown?
- Can the change be validated with build, smoke test, or quick manual play?
