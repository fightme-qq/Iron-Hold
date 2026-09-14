# Recipe: Add Win And Lose State

Use skills:

- `phaser-game-systems`
- `phaser-scene-workflow`
- `phaser-ui-hud`

Steps:

1. Define one win condition and one lose condition.
2. Keep state transitions explicit: playing, won, lost, restarting.
3. Stop timers, spawns, and input side effects when the run ends.
4. Show a simple result message or overlay.
5. Provide restart/continue input.
6. Validate that win/lose cannot fire repeatedly.
