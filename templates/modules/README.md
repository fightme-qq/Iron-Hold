# Module Templates

These files are reusable starting points for agents.

They are intentionally outside `src/` so they do not compile until copied or adapted.

Use them when a feature needs a common system shape:

- `InputActions.ts`: action-based input snapshot.
- `TimerSystem.ts`: countdown/count-up loop.
- `HealthSystem.ts`: health, damage, invulnerability.
- `ObjectPool.ts`: reusable object lifecycle.
- `PhaserSpritePool.ts`: Phaser Group-based sprite recycling.
- `DebugOverlay.ts`: development-only text overlay.
- `AudioManager.ts`: music/SFX volume and unlock shape.
- `AnimationStateMachine.ts`: animation state transitions.

Before copying a template:

1. Pick the matching skill.
2. Rename types and events to match the game.
3. Keep only the code needed for the first playable.
4. Add validation notes after testing.
