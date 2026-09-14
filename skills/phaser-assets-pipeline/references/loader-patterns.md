# Loader Patterns

Load assets from `PreloadScene` by manifest helpers.

Use Phaser loader methods by type:

- `load.image`
- `load.spritesheet`
- `load.atlas`
- `load.audio`
- `load.bitmapFont`
- `load.tilemapTiledJSON`

Rules:

- Keep preload deterministic.
- Show progress only if it improves user experience.
- Avoid loading from remote URLs.
- If assets fail, check browser network tab, path, key, case sensitivity, and Vite public path.
