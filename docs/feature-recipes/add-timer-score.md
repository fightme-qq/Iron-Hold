# Recipe: Add Timer Or Score

Use skills:

- `phaser-game-systems`
- `phaser-ui-hud`
- `phaser-testing`

Steps:

1. Keep score/time in state or a small gameplay system.
2. Display it through HUD/UI, not buried in world objects.
3. Decide what happens at zero, target score, or best score.
4. Persist best score only after the loop works.
5. Validate text fits on phone and desktop.
