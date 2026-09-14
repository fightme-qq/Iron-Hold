# Scene Communication

Preferred options:

1. Pass simple data through `scene.start(key, data)` or `scene.launch(key, data)`.
2. Use `src/game/events/EventBus.ts` for typed cross-scene notifications such as gameplay -> HUD updates.
3. Use a small state module for cross-scene state.
4. Use save modules only for persisted data.

Avoid:

- Reading random properties from another scene.
- Calling `scene.get()` just to mutate another scene's UI.
- Global mutable objects without ownership.
- Circular scene dependencies.
- UI scene directly mutating gameplay internals.

For platform integrations like Yandex, use `platform/` adapters instead of scattering SDK calls across scenes.
