# Recipe: Add Pause And Restart

Use skills:

- `phaser-scene-workflow`
- `phaser-ui-hud`
- `phaser-audio-sfx`

Steps:

1. Decide whether pause is a scene overlay or state inside gameplay.
2. Freeze gameplay timers, physics, input, and spawns.
3. Keep restart cleanup deterministic.
4. Stop duplicated event listeners on shutdown.
5. Pause/resume audio and platform gameplay APIs when publishing requires it.
6. Validate restart several times in one browser session.
