# Tilemaps

Use Tiled for map authoring when the game is tile/world based.

Suggested folders:

```text
public/assets/tilemaps/
public/assets/tilesets/
```

Rules:

- Keep layer names stable: `ground`, `collision`, `objects`, `decor`.
- Document collision and object-layer semantics.
- Load with `load.tilemapTiledJSON`.
- Keep tileset image paths compatible with Vite public assets.
