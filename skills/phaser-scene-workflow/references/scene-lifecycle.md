# Scene Lifecycle

Common Phaser scene hooks:

- `constructor`: set scene key only.
- `init(data)`: receive scene data.
- `preload`: load assets only.
- `create`: create objects, systems, input, events.
- `update(time, delta)`: frame updates; keep it short.
- `shutdown`/events: clean up listeners and platform state.

Rules:

- Avoid asset loading in gameplay scenes unless streaming is intentional.
- Avoid creating keyboard/pointer listeners repeatedly without cleanup.
- Avoid long logic directly inside `update`; delegate to systems.
- Use `scene.start` for replacing a scene and `scene.launch` for overlays.
