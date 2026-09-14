# Recipe: Add Save Progress

Use skills:

- `phaser-game-systems`
- `phaser-testing`

Steps:

1. Save only meaningful data: settings, best score, unlocks, level progress.
2. Use `src/game/save/SaveManager.ts` for slots, schema version, and safe defaults.
3. Handle missing, malformed, or old saves gracefully.
4. Never store Phaser objects.
5. Add a reset path for development.
6. Validate reload behavior in the browser.
