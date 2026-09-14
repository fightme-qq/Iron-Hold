# Recipe: Add Health And Damage

Use skills:

- `phaser-game-systems`
- `phaser-gamefeel`
- `phaser-ui-hud`

Steps:

1. Store health in state or a small system, not directly on random sprites.
2. Define damage sources and invulnerability timing.
3. Add hit feedback: flash, knockback, sound, or brief camera effect.
4. Update HUD through events or explicit state reads.
5. Define zero-health behavior: fail, respawn, restart, or game over.
6. Validate damage cannot trigger every frame unless intended.
