# Phaser Scale Manager

Common scale modes:

- `FIT`: preserve logical size and aspect ratio; can letterbox.
- `RESIZE`: canvas follows viewport size; requires responsive world/UI logic.
- `ENVELOP`: fills but may crop.
- `NONE`: manual sizing.

Default generated projects use `FIT` because it is simpler for first playable loops.

Rules:

- Centralize scale config in `src/game/config/gameConfig.ts`.
- Avoid reading `window.innerWidth` everywhere.
- Use `this.scale.width` and `this.scale.height` in scenes.
- Listen for resize only in a dedicated layout helper/system when needed.
