# Recipe: Add Player

Use skills:

- `phaser-scene-workflow`
- `phaser-input-mobile-desktop`
- `phaser-spritesheet-pipeline` if animated or processed from generated art
- `phaser-debug-performance` if tuning physics

Steps:

1. Define the core player action.
2. Add or update an entity/factory under `src/game/entities/` when setup repeats.
3. Route raw input through `src/game/input/`.
4. Keep movement/update logic small and readable.
5. Add visible feedback for action, hit, pickup, or failure.
6. Validate desktop and mobile input paths.
