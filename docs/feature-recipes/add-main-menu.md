# Recipe: Add Main Menu

Use skills:

- `phaser-scene-workflow`
- `phaser-ui-hud`
- `phaser-audio-sfx`

Steps:

1. Add a MenuScene only when the first playable needs entry choices.
2. Keep buttons large enough for touch and readable on desktop.
3. Start gameplay through `src/game/scenes/sceneTransitions.ts`.
4. Avoid complex settings/progression before the loop works.
5. Validate menu -> game -> restart/menu flow.
